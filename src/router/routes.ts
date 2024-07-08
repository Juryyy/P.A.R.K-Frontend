import { RouteRecordRaw } from 'vue-router';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from 'src/stores/userStore';
import { Notify } from 'quasar';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/NewMainLayout.vue'),
    beforeEnter: checkAuth,
    children: [
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
        path: 'user/:id',
        component: () => import('pages/UserProfilePage.vue'),
        name: 'UserProfile',
      },
      {
        path: 'users',
        component: () => import('pages/admin/UsersPage.vue'),
        name: 'Users',
      },
      {
        path: 'import-candidates',
        component: () => import('pages/admin/CandidatesImport.vue'),
        name: 'ImportCandidates',
        beforeEnter: checkOffice,
      },
      {
        path: 'exams',
        component: () => import('pages/admin/ExamsPage.vue'),
        name: 'Exams',
        beforeEnter: checkOffice,
      },
      {
        path: 'exams/:id',
        component: () => import('pages/ExamPage.vue'),
        name: 'Exam',
        beforeEnter: checkOffice,
        props: true,
      },
      {
        path: 'create-availability',
        component: () => import('pages/admin/CreateAvailabilityPage.vue'),
        name: 'CreateAvailability',
        beforeEnter: checkOffice,
      },
      {
        path: 'admin-panel',
        component: () => import('pages/admin/AdminPanel.vue'),
        name: 'AdminPanel',
        beforeEnter: checkOffice,
      },
    ],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    name: 'Login',
  },
  {
    path: '/forgot-password',
    component: () => import('pages/ForgotPasswordPage.vue'),
    name: 'ForgotPassword',
  },
  {
    path: '/verify',
    component: () => import('pages/VerifyPage.vue'),
    name: 'Verify',
  },
  {
    path: '/test',
    component: () => import('pages/TestPage.vue'),
    name: 'Test',
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

function checkAuth(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const user = useUserStore().getUserInfo();
  if (!user.email) {
    next('/login');
  } else {
    next();
  }
}

function checkOffice(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const user = useUserStore().getUserInfo();
  if (!user.role?.includes('Office')){
    Notify.create('You are not authorized to access this page');
    next('/');
  } else {
    next();
  }
}

export default routes;
