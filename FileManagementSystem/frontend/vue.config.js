const { defineConfig } = require('@vue/cli-service');

// vue.config.js
module.exports = {
  devServer: {
    allowedHosts: 'all', // Allows all hosts
    client: {
      webSocketURL: 'https://4340-2001-f40-990-752a-536-f15d-ab62-fa9f.ngrok-free.app', // Replace with your actual ngrok URL
    },
  },
};
