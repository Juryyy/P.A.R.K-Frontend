<template>
  <q-layout view="hHh LpR fff">
    <q-header elevated class="bg-primary text-dark">
      <q-toolbar>
        <q-btn
          class="q-mini-drawer-only"
          dense
          flat
          round
          icon="menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title v-if="!isMobile"> P.A.R.K. App </q-toolbar-title>
        <q-toolbar-title v-else></q-toolbar-title>
        <div v-if="!userStore.rightDrawerOpen" class="q-gutter-md row items-center">
          <q-avatar size="md" class="clickable-avatar" @click="viewUser(user)">
            <img :src="userStore.userAvatar" alt="User Avatar" />
          </q-avatar>
          <div class="user-info row items-center">
            <q-icon
              v-if="user?.isSenior"
              color="red"
              name="stars"
              size="xs"
            />
            <b class="q-px-xs">{{ user?.firstName }} {{ user?.lastName }}</b>
          </div>
        </div>
        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
        <q-btn icon="logout" flat round @click="logout" />
      </q-toolbar>
    </q-header>
    <div v-if="user">
      <q-drawer
      show-if-above
      v-model="drawerLeft"
      side="left"
      elevated
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      mini-to-overlay
    >
      <div class="mobile-header bg-primary q-px-md q-py-sm" v-if="isMobile">
        <q-toolbar-title class="text-center">P.A.R.K. App</q-toolbar-title>
      </div>
      <div class="drawer-content">
        <div class="flex-grow">
          <q-list>
            <essential-link
              v-for="link in essentialLinks.filter(link => !link.isActiveBlocked)"
              :key="link.title"
              :title="link.title"
              :link="link.link"
              :icon="link.icon"
              :notification-count="link.notificationCount"
              :is-mini="miniState"
            />
          </q-list>
          <q-separator
            color="primary"
            spaced="8px"
            v-if="user?.role?.includes('Office') || user?.role?.includes('Developer')"
          />
          <q-list v-if="user?.role?.includes('Office') || user?.role?.includes('Developer')">
            <essential-link
              v-for="link in adminEssentialLinks.filter(link => !link.isActiveBlocked)"
              :key="link.title"
              :title="link.title"
              :link="`/admin/${link.link}`"
              :icon="link.icon"
              :notification-count="link.notificationCount"
              :is-mini="miniState"
            />
          </q-list>
        </div>
        <div class="bottom-section">
          <q-list>
            <essential-link
              :title="versionLink.title"
              :link="versionLink.link"
              :icon="versionLink.icon"
            />
          </q-list>
        </div>
      </div>
    </q-drawer>
    </div>
    <q-drawer v-model="userStore.rightDrawerOpen" side="right" elevated class="right-drawer">
      <div class="user-info-section">
        <q-img src="/background.jpg" style="height: 150px">
          <div class="bg-transparent absolute-center q-pa-md drawer-avatar-box">
            <q-avatar size="80px" class="q-mr-md clickable-avatar" @click="viewUser(user)">
              <img :src="userStore.userAvatar" alt="User Avatar" />
            </q-avatar>
            <div>
              <div class="text-weight-bold">
                {{ user?.firstName }} {{ user?.lastName }}
                <q-icon
                  v-if="user?.isSenior"
                  color="red"
                  name="stars"
                  class="q-mr-sm"
                  size="xs"
                />
              </div>
              <div>
                <q-badge
                  v-for="role in sortRoles(user?.role as RoleEnum[])"
                  :key="role"
                  :color="getRoleColor(role as RoleEnum)"
                  class="q-mr-sm q-mb-sm"
                  :label="role"
                />
              </div>
            </div>
          </div>
        </q-img>
      </div>

      <q-scroll-area class="exam-cards-scroll-area">
        <q-card-section class="q-pa-md">
          <q-card
            v-for="exam in usersExamsRef"
            :key="exam.id"
            :class="['exam-card', 'q-mb-md', exam.isPrepared ? 'is-prepared' : 'is-not-prepared']"
            bordered
          >
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">{{ exam.venue }} - {{ exam.location }}</div>
                <q-chip :color="exam.isPrepared ? 'positive' : 'warning'" text-color="white">
                  {{ exam.isPrepared ? 'Prepared' : 'Not Prepared' }}
                <q-tooltip v-if="!exam.isPrepared">
                    The exam is not prepared yet and all information may not be accurate
                </q-tooltip>
              </q-chip>
                <q-chip v-if="exam.isPrepared" :color="getUserConfirmationStatus(exam).isConfirmed ? 'positive' : 'negative'" text-color="white">
                  {{ getUserConfirmationStatus(exam).isConfirmed ? 'Confirmed' : 'Not Confirmed' }} - {{ getUserConfirmationStatus(exam).role }}
                  <q-tooltip v-if="exam.isPrepared && !getUserConfirmationStatus(exam).isConfirmed">
                    Visit the exam page to confirm your attendance
                  </q-tooltip>
                  <q-tooltip v-if="exam.isPrepared && getUserConfirmationStatus(exam).isConfirmed">
                    You have confirmed your attendance. Thank you!
                  </q-tooltip>
                </q-chip>
              </div>
              <div class="row q-gutter-sm">
                <q-chip outline color="primary">
                  <q-icon name="event" left />
                  {{ formatDateString(exam.startTime) }}
                </q-chip>
                <q-chip outline color="secondary">
                  <q-icon name="schedule" left />
                  {{ formatTimeString(exam.startTime) }} - {{ formatTimeString(exam.endTime) }}
                </q-chip>
                <q-chip outline color="accent">
                  <q-icon name="school" left />
                  {{ exam.type }}
                </q-chip>
              </div>
              <q-separator class="q-my-md" />
              <div class="text-body2 q-mb-md">
                <strong>Note:</strong>
                <span v-if="shouldShowMoreLink(exam.note)" @click="showFullNoteDialog(exam.note)" class="cursor-pointer">
                  {{ truncatedNote(exam.note) }}
                  <span class="text-primary">...more</span>
                </span>
                <span v-else>{{ exam.note }}</span>
              </div>
              <div class="row justify-end q-gutter-sm">
                <q-btn color="primary" icon="visibility" @click="viewExam(exam.id)" />
                <q-btn color="secondary" icon="map" @click="showVenue(exam.venueLink)" />
                <q-btn color="accent" icon="event" @click="addToGoogleCalendar(exam)" />
              </div>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-dialog v-model="showNoteDialog">
        <q-card class="note-dialog-card">
          <q-card-section>
            <div class="text-h6">Full Note</div>
            <div class="note-content">{{ selectedNote }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              color="primary"
              label="Close"
              @click="showNoteDialog = false"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref, nextTick, watch, onMounted } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/Auth_nav/EssentialLink.vue';
import { useUserStore } from 'src/stores/userStore';
import { useAuthStore } from 'src/stores/authStore';
import { useExamStore } from 'src/stores/examStore';
import { router } from 'src/router/index';
import { ExamWithVenueLink, RoleEnum } from 'src/db/types';
import { Loading } from 'quasar';
import { getRoleColor } from 'src/helpers/Color';
import { sortRoles } from 'src/helpers/FormatRole';
import { formatDateString, formatTimeString } from 'src/helpers/FormatTime';
import { storeToRefs } from 'pinia';
import { useAvailabilityStore } from 'src/stores/availabilityStore';

const userStore = useUserStore();
const authStore = useAuthStore();
const examStore = useExamStore();
const availabilityStore = useAvailabilityStore();

onBeforeMount(async () => {
  Loading.show({
    message: 'Loading users exams',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  usersExamsRef.value = userStore.usersExams as ExamWithVenueLink[];
  await userStore.getUsersAvatar();
  await availabilityStore.countNewResponses();
  Loading.hide();
});

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};
const { usersExams, refreshTrigger} = storeToRefs(userStore);
const usersExamsRef = ref<ExamWithVenueLink[]>([]);
const user = computed(() => userStore.user);
const showNoteDialog = ref(false);
const selectedNote = ref('');
const isInitialMount = ref(true);

//This part is for fetching number for notification count
const availabilityCount = computed(() => availabilityStore.newResponses);

const shouldShowMoreLink = (note: string | undefined) => {
  const maxLength = 19;
  return note && note.length > maxLength;
};

const showFullNoteDialog = (note: string) => {
  selectedNote.value = note;
  showNoteDialog.value = true;
};

const truncatedNote = (note: string | undefined) => {
  const maxLength = 19;
  if (note && note.length > maxLength) {
    return `${note.substring(0, maxLength)}`;
  }
  return note;
};

const essentialLinks = computed<EssentialLinkProps[]>(() => [
  {
    title: 'Home',
    link: '/',
    icon: 'home',
    isActiveBlocked: !user.value.activatedAccount,
  },
  {
    title: 'My Availability',
    link: '/availabilty-check',
    icon: 'calendar_today',
    isActiveBlocked: !user.value.activatedAccount,
    notificationCount: availabilityCount.value,
  },
  {
    title: 'My Profile',
    link: '/user/' + user.value.id,
    icon: 'person',
  },
  {
    title: 'Other Users',
    link: '/users',
    icon: 'people',
    isActiveBlocked: !user.value.activatedAccount,
  },
]);

const adminEssentialLinks: EssentialLinkProps[] = [
  //{
  //  title: 'Import Candidates',
  //  link: 'import-candidates',
  //  icon: 'cloud_upload',
  //},
  {
    title: 'Create Availability',
    link: 'create-availability',
    icon: 'event_note',
    isActiveBlocked: !user.value.activatedAccount,
  },
  {
    title: 'Create Exams',
    link: 'exams',
    icon: 'assignment',
    isActiveBlocked: !user.value.activatedAccount,
  },
  {
    title: 'Admin Panel',
    link: 'admin-panel',
    icon: 'admin_panel_settings',
    isActiveBlocked: !user.value.activatedAccount,
  },
];

const versionLink: EssentialLinkProps = {
  title: 'Version',
  link: '/version',
  icon: 'info',
};

const toggleLeftDrawer = () => {
  drawerLeft.value = !drawerLeft.value;
};

const drawerLeft = ref(false);


function toggleRightDrawer() {
  userStore.toggleRightDrawer();
}

const miniState = ref(true);

const showVenue = (gLink: string) => {
  window.open(gLink, '_blank');
};

const viewUser = async (user: any) => {
  await nextTick();
  router.push(`/user/${user.id}`);
};

const isMobile = ref(false);

const updateIsMobile = () => {
  isMobile.value = window.innerWidth <= 600;
};

const addToGoogleCalendar = (exam: ExamWithVenueLink) => {
  const startDate = new Date(exam.startTime);
  const endDate = new Date(exam.endTime);

  // Adjust the time by subtracting one hour
  startDate.setHours(startDate.getHours() - 1);
  endDate.setHours(endDate.getHours() - 1);

  const formattedStart = startDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const formattedEnd = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const eventDetails = {
    action: 'TEMPLATE',
    text: `${exam.type} Exam - ${exam.venue}`,
    dates: `${formattedStart}/${formattedEnd}`,
    details: `Exam Type: ${exam.type}\nLevels: ${exam.levels.join(', ')}\nNote: ${exam.note}`,
    location: `${exam.venue}, ${exam.location}`
  };

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?${new URLSearchParams(eventDetails).toString()}`;
  window.open(googleCalendarUrl, '_blank');
};

const viewExam = async (examId: number) => {
  await nextTick();
  router.push(`/exam/${examId}`);
};

const getUserConfirmationStatus = (exam: ExamWithVenueLink) => {
  const userId = userStore.user?.id;
  const userConfirmation = exam.userConfirmations?.find(
    (confirmation) => confirmation.userId === userId && confirmation.examId === exam.id
  );

  return {
    isConfirmed: userConfirmation?.isConfirmed || false,
    role: userConfirmation?.role || 'N/A'
  };
};

watch(
  () => refreshTrigger.value,
  async () => {
    if (isInitialMount.value) {
      isInitialMount.value = false;
      return;
    }
    const updatedExams = await userStore.getUsersExams();
    if (updatedExams) {
      usersExamsRef.value = updatedExams;
    }
  }
);

onMounted(async () => {
  const updatedExams = await userStore.getUsersExams();
  if (updatedExams) {
    usersExamsRef.value = updatedExams;
  }
});


window.addEventListener('resize', updateIsMobile);
updateIsMobile();
</script>

<style lang="scss" scoped>

.note-dialog-card {
  min-width: 300px;
  max-width: 500px;
  .note-content {
    margin-top: 16px;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.drawer-avatar-box {
  display: flex;
  align-items: center;
  text-align: left;
}

.drawer-avatar-box .text-weight-bold {
  margin-bottom: 4px;
}

.card {
  background-color: $primary;
}

.user-info {
  display: flex;
  align-items: center;
}

.clickable-avatar {
  cursor: pointer;
}

.isPrepared {
  background-color: $primary;
}

.isNotPrepared {
  background-color: $primary-light;
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem; /* Adjust the gap between buttons as needed */
}

.mobile-header {
  color: #000000;
  display: none;
}

@media (max-width: 600px) {
  .mobile-header {
    display: flex;
  }
}

.exam-card {
  transition: all 0.3s ease;
  border-left: 5px solid $grey-5;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(55, 230, 39, 0.795);
  }

  &.is-prepared {
    border-left-color: $positive;
  }

  &.is-completed {
    border-left: 5px solid #FFA000 !important;
  }
}

.text-h6 {
  color: $primary;
}

.q-chip {
  font-weight: 600;
}

.q-btn {
  font-weight: 600;
}

.right-drawer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.user-info-section {
  flex-shrink: 0;
}

.exam-cards-scroll-area {
  flex-grow: 1;
  height: calc(100% - 150px);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.flex-grow {
  flex-grow: 1;
}

.help-links {
  margin-top: auto;
  padding-bottom: 8px;
}
</style>
