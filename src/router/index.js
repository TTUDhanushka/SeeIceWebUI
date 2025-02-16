import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'


const routes = [
  {
    path: '/',
    name:'dashboard',
    component: DashboardView,
    props: true
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
