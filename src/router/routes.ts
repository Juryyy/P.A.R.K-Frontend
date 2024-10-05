import { RouteRecordRaw } from 'vue-router';
import { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useUserStore } from 'src/stores/userStore';
import { Notify } from 'quasar';
import { useExamStore } from 'src/stores/examStore';

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
        path: 'exam/:id',
        component: () => import('pages/ViewExamPage.vue'),
        name: 'ViewExam',
        props: true,
        beforeEnter: examCheck,
        meta: {
          title: 'Exam',
        },
      },
      // Admin routes
      {
        path: '/admin',
        children: [
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
        component: () => import('pages/admin/ExamPage.vue'),
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
  if (user.role?.includes('Office') || user.role?.includes('Developer')) {
    next();
  } else {
    next(false); // Indicate that this check did not grant access
  }
}

function checkOfficeTrue(): boolean {
  const user = useUserStore().getUserInfo();
  return (user.role && (user.role.includes('Office') || user.role.includes('Developer'))) ?? false;
}

function checkIfAssigned(): boolean {
  const user = useUserStore().getUserInfo();
  const exam = useExamStore().selectedExam;

  if (!exam) {
    return false;
  }

  return exam.supervisors.some(supervisor => supervisor.id === user.id) ||
    exam.invigilators.some(invigilator => invigilator.id === user.id) ||
    exam.examiners.some(examiner => examiner.id === user.id);
}

function examCheck(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  if (checkOfficeTrue()) {
    next();
  } else if (checkIfAssigned()) {
    next();
  } else {
    Notify.create('You are not authorized to access this page');
    next('/');
  }
}

export default routes;
