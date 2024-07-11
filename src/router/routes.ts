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
        meta: {
          title: 'Home',
        },
      },
      {
        path: 'availabilty-check',
        component: () => import('pages/AvailabilityCheck.vue'),
        name: 'AvailabiltyCheck',
        meta: {
          title: 'Availability',
        },
      },
      {
        path: 'user/:id',
        component: () => import('pages/UserProfilePage.vue'),
        name: 'UserProfile',
        props: true,
        meta: {
          title: 'Profile',
        },
      },
      {
        path: 'users',
        component: () => import('pages/admin/UsersPage.vue'),
        name: 'Users',
        meta: {
          title: 'Users',
        },
      },
      {
        path: 'import-candidates',
        component: () => import('pages/admin/CandidatesImport.vue'),
        name: 'ImportCandidates',
        beforeEnter: checkOffice,
        meta: {
          title: 'Import Candidates',
        },
      },
      {
        path: 'exams',
        component: () => import('pages/admin/ExamsPage.vue'),
        name: 'Exams',
        beforeEnter: checkOffice,
        meta: {
          title: 'Exams',
        },
      },
      {
        path: 'exams/:id',
        component: () => import('pages/ExamPage.vue'),
        name: 'Exam',
        beforeEnter: checkOffice,
        props: true,
        meta: {
          title: 'Exam',
        },
      },
      {
        path: 'create-availability',
        component: () => import('pages/admin/CreateAvailabilityPage.vue'),
        name: 'CreateAvailability',
        beforeEnter: checkOffice,
        meta: {
          title: 'Create Availability',
        },
      },
      {
        path: 'admin-panel',
        component: () => import('pages/admin/AdminPanel.vue'),
        name: 'AdminPanel',
        beforeEnter: checkOffice,
        meta: {
          title: 'Admin Panel',
        },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    name: 'Login',
    meta: {
      title: 'Login',
    },
  },
  {
    path: '/forgot-password',
    component: () => import('pages/ForgotPasswordPage.vue'),
    name: 'ForgotPassword',
    meta: {
      title: 'Forgot Password',
    },
  },
  {
    path: '/verify',
    component: () => import('pages/VerifyPage.vue'),
    name: 'Verify',
    meta: {
      title: 'Verify',
    },
  },
  {
    path: '/test',
    component: () => import('pages/TestPage.vue'),
    name: 'Test',
    meta: {
      title: 'Test',
    },
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
    name: 'ErrorNotFound',
    meta: {
      title: 'Error',
    },
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
