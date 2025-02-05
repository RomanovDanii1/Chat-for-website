import { createRouter, createWebHistory } from 'vue-router';
import Chat from '../components/Chat.vue';
import ManagerDashboard from '../components/ManagerDashboard.vue';

const routes = [
  { path: '/', name: 'Chat', component: Chat },
  { path: '/manager', name: 'ManagerDashboard', component: ManagerDashboard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
