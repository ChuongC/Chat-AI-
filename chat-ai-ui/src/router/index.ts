import { createRouter, createWebHistory } from 'vue-router';
import ChatView from '../views/ChatView.vue';

const routes = [
    {path: '/', component: ChatView},
    { path: '/:pathMatch(.*)*', redirect: '/' }, // catch all → chat
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});

