<template>
  <div class="explorer-container" @click="clearSelectedFile">
    <div class="sidebar-container">
      <div class="header_sidebar">
        <h2>Explorer</h2>
      </div>
      <aside class="sidebar">
        <ul>
          <li @click="filterFiles('all')">
            <img src="@/assets/icons/folder.svg" alt="All Files Icon" class="icon" />
            Home (All Files)
          </li>
          <li @click="filterFiles('documents')">
            <img src="@/assets/icons/document.svg" alt="Documents Icon" class="icon" />
            Documents
          </li>
          <li @click="filterFiles('pictures')">
            <img src="@/assets/icons/picture.svg" alt="Pictures Icon" class="icon" />
            Pictures
          </li>
          <li @click="filterFiles('music')">
            <img src="@/assets/icons/music.svg" alt="Music Icon" class="icon" />
            Music
          </li>
        </ul>
      </aside>
    </div>

    <div class="content">
      <div class="upload-area" @dragover.prevent @dragenter.prevent="isDragging = true" @dragleave="isDragging = false"
        @drop.prevent="handleDrop" :class="{ 'drag-over': isDragging }">
        <p v-if="filteredFiles.length === 0">Drag & Drop your files here</p>

        <table v-else class="file-table">
          <thead>
            <tr>
              <th><input type="checkbox" v-model="allSelected" @change="selectAllFiles" /></th>
              <th v-for="col in columns" :key="col.key" @click="sortFiles(col.key)"
                :class="{ 'active': sortColumn === col.key }">
                {{ col.label }}
                <span v-if="sortColumn === col.key">{{ sortAscending ? '▲' : '▼' }}</span>
              </th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="file in filteredFiles" :key="file.id">
              
              <td><input type="checkbox" v-model="file.selected" /></td>
              <td>
                <span v-if="!file.editing">{{ file.filename }}</span>
                <input v-if="file.editing" v-model="file.newFilename" @blur="saveNewFilename(file)"
                  @keyup.enter="saveNewFilename(file)" />
              </td>
              <td>{{ (file.FileSize / 1024/1024).toFixed(2) }}</td>
              <td>{{ getFileType(file.filename) }}</td>
              <td>{{ file.created_at ? new Date(file.created_at).toLocaleString() : 'N/A' }}</td>
              <td>
                <button class="action-button" @click.stop="deleteFile(file.id)">Delete</button>
                <button class="action-button" @click.stop="downloadFile(file.id)">Download</button>
                <button class="action-button" @click.stop="editFile(file)">Edit</button>
              </td>
            </tr>
            
          </tbody>
        </table>

        <!-- Button Container for Download and Delete -->
        <div class="button-container">
          <button class="action-button" @click="deleteSelectedFiles">Delete Selected</button>
          <button class="action-button" @click="downloadSelectedFiles">Download Selected</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      files: [],
      filteredFiles: [],
      selectedFile: null,
      sortColumn: '', // Track which column is being sorted
      sortAscending: true, // Track sort direction (ascending/descending)
      isDragging: false,
      allSelected: false, // Track all selected state
      columns: [
        { label: 'Name', key: 'filename' },
        { label: 'Size (MB)', key: 'size' },
        { label: 'Type', key: 'type' },
        { label: 'Date Uploaded', key: 'created_at' },
      ],
    };
  },
  async created() {
    await this.fetchFiles();
    this.filteredFiles = [...this.files];
    console.log(this.filteredFiles);
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    selectAllFiles() {
      this.filteredFiles.forEach(file => (file.selected = this.allSelected));
    },
    async fetchFiles() {
      try {
        const { data } = await axios.get('http://localhost:5000/files');
        this.files = data.map(file => ({ ...file, selected: false })); // Initialize selected property
        this.filteredFiles = [...this.files];
      } catch (error) {
        console.error('Error fetching files:', error.response);
      }
    },
    getFileType(filename) {
      const ext = filename.split('.').pop().toLowerCase();
      if (['jpg', 'png', 'gif'].includes(ext)) return 'Image';
      if (['pdf', 'docx', 'txt'].includes(ext)) return 'Document';
      if (['mp3', 'wav'].includes(ext)) return 'Music';
      return 'Other';
    },
    filterFiles(category) {
      const filters = {
        all: () => this.files,
        documents: () => this.files.filter(f => ['pdf', 'docx', 'txt'].includes(f.filename.split('.').pop())),
        pictures: () => this.files.filter(f => ['jpg', 'png', 'gif'].includes(f.filename.split('.').pop())),
        music: () => this.files.filter(f => ['mp3', 'wav'].includes(f.filename.split('.').pop())),
      };
      this.filteredFiles = filters[category]();
    },
    async deleteFile(id) {
      try {
        await axios.delete(`http://localhost:5000/files/${id}`);
        await this.fetchFiles();
        alert('File deleted!');
      } catch (error) {
        console.error('Error deleting file:', error.response.data);
      }
    },
    selectFile(file) {
      console.log('File selected:', file);
      this.selectedFile = file;
    },
    clearSelectedFile() {
      this.selectedFile = null;
    },
    handleKeydown(event) {
      if (event.key === 'Delete' && this.selectedFile) {
        this.deleteFile(this.selectedFile.id);
        this.clearSelectedFile();
      }
    },
    sortFiles(column) {
      if (this.sortColumn === column) {
        this.sortAscending = !this.sortAscending;
      } else {
        this.sortAscending = true;
      }

      this.sortColumn = column;

      this.filteredFiles.sort((a, b) => {
        const valueA = a[column];
        const valueB = b[column];

        if (typeof valueA === 'string') {
          return this.sortAscending ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }

        return this.sortAscending ? valueA - valueB : valueB - valueA;
      });
    },
    async handleDrop(event) {
      const formData = new FormData();
      Array.from(event.dataTransfer.files).forEach(file => formData.append('file', file));

      try {
        await axios.post('http://localhost:5000/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        await this.fetchFiles();
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Upload error:', error);
      } finally {
        this.isDragging = false;
      }
    },
    editFile(file) {
      this.filteredFiles.forEach(f => (f.editing = false)); // Disable editing on other files
      file.editing = true;
      file.newFilename = file.filename; // Store the current filename for editing
      file.originalExtension = file.filename.split('.').pop(); // Store the original file extension
    },
    async saveNewFilename(file) {
      file.editing = false;

      if (file.newFilename !== file.filename) {
        const newExtension = file.newFilename.split('.').pop();
        if (newExtension !== file.originalExtension) {
          alert(`Please do not change the file extension. The original extension is .${file.originalExtension}`);
          file.newFilename = file.filename; // Revert to the original filename
          return; // Stop further execution
        }

        try {
          await axios.put(`http://localhost:5000/files/${file.id}`, {
            filename: file.newFilename.trim(),
          });

          file.filename = file.newFilename.trim();
          alert('File renamed successfully!');
        } catch (error) {
          console.error('Error renaming file:', error);
          alert('Failed to rename the file.');
        }
      }
    },
    cancelEdit(file) {
      file.editing = false;
    },
    async deleteSelectedFiles() {
      const selectedFiles = this.filteredFiles.filter(file => file.selected);
      if (selectedFiles.length === 0) {
        alert('No files selected for deletion.');
        return;
      }

      if (confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) {
        try {
          await Promise.all(selectedFiles.map(file =>
            axios.delete(`http://localhost:5000/files/${file.id}`)
          ));
          await this.fetchFiles(); // Refresh file list
          alert('Selected files deleted successfully!');
        } catch (error) {
          console.error('Error deleting files:', error);
          alert('Failed to delete files.');
        }
      }
    },
    async downloadSelectedFiles() {
      const selectedFiles = this.filteredFiles.filter(file => file.selected);
      if (selectedFiles.length === 0) {
        alert('No files selected for download.');
        return;
      }

      for (const file of selectedFiles) {
        try {
          const response = await axios.get(`http://localhost:5000/download/${file.id}`, {
            responseType: 'blob',
          });

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', file.filename); // Use original filename

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error(`Error downloading file ${file.filename}:`, error);
          alert(`Failed to download ${file.filename}.`);
        }
      }
      alert('Selected files downloaded successfully!');
    },
    async downloadFile(id) {
      try {
        const response = await axios.get(`http://localhost:5000/download/${id}`, {
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const fileData = this.filteredFiles.find(file => file.id === id);
        const filename = fileData ? fileData.filename : 'downloaded_file';

        link.setAttribute('download', filename); // Set the filename for download

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error(`Error downloading file with ID ${id}:`, error);
        alert('Failed to download the file.');
      }
    },
  },
};
</script>

<style>
body {
  margin: 0;
}
</style>

<style scoped>
/* Overall Layout */
.explorer-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1e1e2f, #3b3b5c);
  color: white;
}

.sidebar-container {
  display: flex;
  /* Enable flexbox layout */
  flex-direction: column;
  /* Stack items vertically */
}

.header_sidebar {
  background-color: #3b3b5c;
  /* Darker background for the header box */
  padding-right: 10px;
  padding-bottom: 20px;
  padding-left: 10px;
  /* Padding for spacing */
  text-align: center;
  /* Center the text */
  width: 200px;
  /* Fill the width of the sidebar */
  height: 50px;
}

/* Sidebar Styles */
.sidebar {
  width: 200px;
  height: 100%;
  background-color: #2b2b4e;
  padding: 10px;
  margin-top: 0px;
  /* Push below the header bar */
  flex-direction: column;
  /* Align items vertically */
  align-items: flex-start;
  /* Align items to the start (left) */
}

.sidebar ul {
  list-style: none;
  /* Remove bullet points */
  padding: 0;
  /* Remove padding */
  width: 100%;
  /* Make the list take full width */
}

.sidebar ul li {
  margin: 10px 0;
  /* Space between list items */
  cursor: pointer;
  /* Change cursor to pointer */
  display: flex;
  /* Use flexbox for alignment */
  align-items: center;
  /* Center items vertically */
  text-align: left;
  /* Align text to the left */
}

.icon {
  margin-right: 8px;
  /* Space between icon and text */
  width: 20px;
  /* Set icon width */
  height: 20px;
  /* Set icon height */
}

/* Content Area */
.content {
  flex: 1;
  /* Take up remaining space */
  padding: 0px;
  /* Padding for content */
}

.upload-area {
  border: 1px dashed #56568a;
  /* Dashed border for drag-and-drop area */
  padding: 10px;
  /* Padding for drag-and-drop area */
  text-align: center;
  /* Center text in the area */
  transition: background-color 0.3s;
  /* Smooth transition for background color */
}

.drag-over {
  background-color: rgba(86, 86, 138, 0.3);
  /* Background color when dragging over */
}

.file-table {
  width: 100%;
  /* Full width for the table */
  border-collapse: collapse;
  /* Collapse borders for table */
  margin-top: 0px;
  /* Space above the table */
}

.file-table th {
  cursor: pointer;
  padding: 10px;
  text-align: left;
  font-family: 'Lucida Sans', Geneva, Verdana, sans-serif;
  background-color: #414171;
  color: white;
  border: 5px solid #080811;
  position: relative;
  /* To align arrows correctly */
}

th.active {
  background-color: #5959a3;
  /* Highlight active column */
}

th span {
  font-size: 12px;
  margin-left: 8px;
  position: absolute;
  right: 10px;
}

.file-table td {
  font-family: 'Times New Roman', Times, serif;
  border: 1px solid #56568a;
  /* Border for table cells */
  padding: 10px;
  /* Padding for table cells */
  text-align: left;
  /* Left-align text */
}

.selected {
  background-color: rgba(149, 0, 248, 0.2);
  /* Highlight selected row */
}

.action-button {
  background-color: #22016d;
  /* Purple background */
  color: white;
  /* Text color */
  border: none;
  /* No border */
  border-radius: 150px;
  /* Rounded corners */
  padding: 10px;
  /* Padding for better spacing */
  cursor: pointer;
  /* Change cursor on hover */
  transition: background-color 0.3s;
  /* Smooth transition for hover effect */
  width: 100%;
  /* Make the button fill the column */
  display: flex;
  /* Use flexbox for button layout */
  justify-content: center;
  /* Center text horizontally */
  align-items: center;
  /* Center text vertically */
  margin-top: 15px;
}

.action-button:hover {
  background-color: #6a006a;
  /* Darker purple on hover */
}

.button-container {
  display: flex;
  /* Use flexbox for button layout */
  justify-content: flex-end;
  /* Align buttons to the right */
  margin-top: 10px;
  margin-left: 900px;
  /* Space above the button container */
}
</style>
