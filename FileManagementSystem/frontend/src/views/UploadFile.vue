<template>
    <div>
      <h1>Upload File</h1>
      <input type="file" @change="onFileChange" />
      <button @click="uploadFile">Upload</button>
    </div>
  </template>

  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        file: null,
      };
    },
    methods: {
      onFileChange(e) {
        this.file = e.target.files[0];
      },
      async uploadFile() {
        const formData = new FormData();
        formData.append('file', this.file);
  
        try {
          const res = await axios.post('http://localhost:5000/upload', formData);
          alert('File uploaded: ' + res.data.file);
        } catch (err) {
          console.error(err);
        }
      },
    },
  };
  </script>

  
  