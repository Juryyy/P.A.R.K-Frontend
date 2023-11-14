import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/test',
    component: () => import('pages/ErrorTest.vue'),
  },
  {
    path: '/availabilty-check',
    component: () => import('pages/AvailabilityCheck.vue'),
    name: 'AvailabiltyCheck',
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
