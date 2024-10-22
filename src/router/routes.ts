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
      {
        path: '/version',
        component: () => import('pages/VersionPage.vue'),
        name: 'Version',
        meta: {
          title: 'Version',
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
    beforeEnter: checkLogin,
    meta: {
      title: 'Login',
    },
  },
  /*{
    path: '/test',
    component: () => import('pages/TestPage.vue'),
    name: 'Test',
    meta: {
      title: 'Test',
    },
  },*/
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

async function checkOfficeTrue(to: RouteLocationNormalized): Promise<boolean> {
  const user = useUserStore().getUserInfo();
  const examId = Number(to.params.id);
  await useExamStore().getExam(examId);
  return (user.role && (user.role.includes('Office') || user.role.includes('Developer'))) ?? false;
}

async function checkIfAssigned(to: RouteLocationNormalized): Promise<boolean> {
  const examStore = useExamStore();
  const userStore = useUserStore();
  const examId = Number(to.params.id);

  if (!examId) {
    return false;
  }

  try {
    if (!examStore.selectedExam) {
      await examStore.getExam(examId);
    }

    const user = userStore.getUserInfo();
    const exam = examStore.selectedExam;

    if (!exam) {
      return false;
    }

    const hasAccess = exam.supervisors.some(supervisor => supervisor.id === user.id) ||
      exam.invigilators.some(invigilator => invigilator.id === user.id) ||
      exam.examiners.some(examiner => examiner.id === user.id);

    if (!hasAccess) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking exam access:', error);
    return false;
  }
}


async function examCheck(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  if (await checkOfficeTrue(to)) {
    next();
  } else if (await checkIfAssigned(to)) {
    next();
  } else {
    Notify.create('You are not authorized to access this page');
    next('/');
  }
}

//if user is logged in, redirect to home when trying to access login page
function checkLogin(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const user = useUserStore().getUserInfo();
  if (user.email) {
    next('/');
  } else {
    next();
  }
}

export default routes;
