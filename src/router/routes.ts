import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '',
    component: () => import('pages/IndexPage.vue'),
  },

  {
    path: '/availabilty-check',
    component: () => import('pages/AvailabilityCheck.vue'),
    name: 'AvailabiltyCheck',
  },
  {
    path: '/import-candidates',
    component: () => import('pages/CandidatesImport.vue'),
    name: 'ImportCandidates',
  },
  {
    path: '/test',
    component: () => import('pages/ErrorTest.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
