// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/home',
        name: 'HomeAd',
        component: () => import('../views/HomeAd.vue'),
        children: [
            {
                path: '/welcome',
                name: 'WelcomeAd',
                component: () => import('../views/WelcomeAd.vue'),
            },
            {
                path: '/user',
                name: 'UserAd',
                component: () => import('../views/UserAd.vue'),
            },
            {
                path: '/menu',
                name: 'MenuAd',
                component: () => import('../views/MenuAd.vue'),
            },
            {
                path: '/role',
                name: 'RoleAd',
                component: () => import('../views/RoleAd.vue'),
            },
            {
                path: '/dept',
                name: 'DeptAd',
                component: () => import('../views/DeptAd.vue'),
            },
            {
                path: '/echart',
                name: 'EchartAd',
                component: () => import('../views/EchartAd.vue'),
            },
            {
                path: '/leave',
                name: 'LeaveAd',
                component: () => import('../views/LeaveAd.vue'),
            },
            {
                path: '/approve',
                name: 'ApproveAd',
                component: () => import('../views/ApproveAd.vue'),
            },
            {
                path: '/together',
                name: 'TogetherAd',
                component: () => import('../views/TogetherAd.vue'),
            },
            {
                path: '/track',
                name: 'TrackAd',
                component: () => import('../views/TrackAd.vue'),
            },
        ]
    },
    {
        path: '/login',
        name: 'LoginAd',
        component: () => import('../views/LoginAd.vue'),

    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
