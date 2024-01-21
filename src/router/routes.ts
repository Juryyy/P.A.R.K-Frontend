import { RouteRecordRaw } from 'vue-router';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from 'src/stores/userStore';


const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/NewMainLayout.vue'),
    beforeEnter: checkAuth,
    children:
    [
      {
        path: '',
        component: () => import('pages/IndexPage.vue'),
        name: 'Home',
      },
      {
        path: 'availabilty-check',
        component: () => import('pages/AvailabilityCheck.vue'),
        name: 'AvailabiltyCheck',
      },
      {
        path: 'import-candidates',
        component: () => import('pages/CandidatesImport.vue'),
        name: 'ImportCandidates',
      },
    ]
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

function checkAuth(to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) {
  const user = useUserStore().getUserInfo();
  if (!user.email) {
    next('/login')
  } else {
    next();
  }
}

export default routes;
