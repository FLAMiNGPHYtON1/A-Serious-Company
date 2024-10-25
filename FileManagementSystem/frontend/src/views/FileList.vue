<template>
  <div>
    <h1>Uploaded Files</h1>
    <ul>
      <li v-for="file in files" :key="file.id">
        <input v-model="file.filename" @change="updateFilename(file)" />
        <button @click="deleteFile(file.id)">Delete</button>
        <button @click="downloadFile(file.id)">Download</button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      files: [],
    };
  },
  async created() {
    await this.fetchFiles();
  },
  methods: {
    async fetchFiles() {
      try {
        const response = await axios.get('http://localhost:5000/files');
        this.files = response.data;
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    },
    async deleteFile(id) {
      try {
        console.log("testing1");
        await axios.delete(`http://localhost:5000/files/${id}`);
        alert('File deleted successfully!');
        this.fetchFiles(); // Refresh the file list
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    },
    async updateFilename(file) {
      try {
        await axios.put(`http://localhost:5000/files/${file.id}`, {
          filename: file.filename,
        });
        alert('File name updated successfully!');
      } catch (error) {
        console.error('Error updating file name:', error);
      }
    },
    async downloadFile(id) {
      try {
        // Make a GET request to the backend to download the file
        const response = await axios.get(`http://localhost:5000/download/${id}`, {
          responseType: 'blob', // Ensure response is received as a Blob
        });
        console.log('Response Headers:', response.headers.toJSON());        // Extract filename and MIME type from the response headers
        const contentDisposition = response.headers['content-disposition'];

        let filename;
        const parts = contentDisposition.split('attachment; filename=');

        if (contentDisposition) {
          filename = parts[1].replace(/"/g, '');
        } else {
          filename = 'downloaded_file';
        }

        const mimeType = response.data.type || 'application/octet-stream'; // Get MIME type from Blob

        // Create a Blob object with the correct MIME type
        const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));

        // Create an anchor element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); // Use the extracted filename
        document.body.appendChild(link);
        link.click();
        link.remove(); // Clean up the DOM by removing the link element
      } catch (error) {
        console.error('Error downloading file:', error);
        alert('Failed to download the file.');
      }
    }
    ,
  },
};
</script>

<style scoped>
h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin: 10px 0;
  display: flex;
  align-items: center;
}

button {
  margin-left: 10px;
}
</style>
