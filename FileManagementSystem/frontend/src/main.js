import { createApp } from 'vue';  // Use createApp instead of Vue
import App from './App.vue';
import router from './router';
import 'font-awesome/css/font-awesome.min.css';


createApp(App)
  .use(router) // Use the router plugin
  .mount('#app');
