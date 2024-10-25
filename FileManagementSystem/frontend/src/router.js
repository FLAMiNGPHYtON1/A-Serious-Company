import { createRouter, createWebHistory } from 'vue-router';
// import UploadFile from './views/UploadFile.vue';
import FileList from './views/FileList.vue';
import ExplorerHomePage from './views/ExplorerHomePage.vue';

const routes = [
  // { path: '/', component: UploadFile },
  { path: '/files', component: FileList },
  { path: '/', component: ExplorerHomePage}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
