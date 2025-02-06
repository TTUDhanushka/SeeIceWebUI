// Author: Dhanushka Liyanage

import {createRouter, createWebHistory} from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
    // {path: '/', redirect: '/dashboard'},
    {
        path: '/', 
        name:'dashboard', 
        component: DashboardView
    },
    {
        path: '/settings', 
        name:'settings', 
        component: SettingsView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;