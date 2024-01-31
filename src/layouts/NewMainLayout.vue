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
        <q-toolbar-title> P.A.R.K Admin </q-toolbar-title>
        <div v-if="!rightDrawerOpen">
          <q-avatar size="46px" class="q-pr-xl"
            ><img :src="userAvatar" alt="User Avatar"
          /></q-avatar>
          <b class="q-px-xs">{{ user?.firstName }} {{ user?.lastName }}</b>
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
        <div class="drawer-content">
          <q-list>
            <essential-link
              v-for="link in essentialLinks"
              :key="link.title"
              :title="link.title"
              :link="link.link"
              :icon="link.icon"
            />
          </q-list>
          <q-separator
            color="primary"
            spaced="8px"
            v-if="user.role === 'Office'"
          />
          <q-list v-if="user.role === 'Office'">
            <essential-link
              v-for="link in adminEssentialLinks"
              :key="link.title"
              :title="link.title"
              :link="link.link"
              :icon="link.icon"
            />
          </q-list>
        </div>
      </q-drawer>
    </div>
    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" elevated>
      <q-scroll-area class="fit">
        <q-img
          src="https://cdn.quasar.dev/img/material.png"
          style="height: 150px"
        >
          <div class="bg-transparent absolute-center">
            <q-avatar size="80px" class="q-mb-sm">
              <img :src="userAvatar" alt="User Avatar" />
            </q-avatar>
            <div class="text-weight-bold">
              {{ user?.firstName }} {{ user?.lastName }}
            </div>
            <div>{{ user?.role }}</div>
          </div>
        </q-img>

        <q-card-section class="q-pa-md">
          <q-card
            class="card"
            bordered
            v-for="exam in usersExamsRef"
            :key="exam.id"
          >
            <q-card-section>
              <q-item-label
                >Venue: <b>{{ exam.venue }}</b></q-item-label
              >
              <q-item-label
                >Date: <b>{{ formatDate(exam.startTime) }} </b></q-item-label
              >
              <q-item-label
                >Time:
                <b
                  >{{
                    formatTime(exam.startTime) +
                    ' - ' +
                    formatTime(exam.endTime)
                  }}
                </b></q-item-label
              >
              <q-item-label
                >Type: <b>{{ exam.type }}</b></q-item-label
              >
              <q-item-label
                >Note: <b>{{ exam.note }}</b></q-item-label
              >
            </q-card-section>
          </q-card>
        </q-card-section>

        <div class="absolute-bottom">
          <a
            href="https://www.zkouskypark.cz/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://www.zkouskypark.cz/www/upload/logo/20210118070023666.png"
              class="logo"
            />
          </a>
        </div>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import EssentialLink, {
  EssentialLinkProps,
} from 'components/Auth_nav/EssentialLink.vue';
import { useUserStore } from 'src/stores/userStore';
import { useAuthStore } from 'src/stores/authStore';
import { router } from 'src/router/index';
import { Exam } from 'src/stores/db/types';
import { Loading } from 'quasar';

const userStore = useUserStore();
const authStore = useAuthStore();

onBeforeMount(async () => {
  Loading.show({
    message: 'Loading users exams',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  await userStore.getUsersExams();
  await userStore.getUsersAvatar();
  usersExamsRef.value = userStore.usersExams;
  userAvatar.value = userStore.userAvatar;
  Loading.hide();
});

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

const exams: Exam[] = userStore.usersExams;
const usersExamsRef = ref(exams);
const user = computed(() => userStore.user);
const userAvatar = ref('');

const essentialLinks: EssentialLinkProps[] = [
  {
    title: 'Home',
    link: '/',
    icon: 'home',
  },
  {
    title: 'Availability',
    link: '/availabilty-check',
    icon: 'calendar_today',
  },
];

const adminEssentialLinks: EssentialLinkProps[] = [
  {
    title: 'Import Candidates',
    link: '/import-candidates',
    icon: 'cloud_upload',
  },
  {
    title: 'Create Availability',
    link: '/create-availability',
    icon: 'event_note',
  },
  {
    title: 'Exams',
    link: '/exams',
    icon: 'assignment',
  },
  {
    title: 'Users',
    link: '/users',
    icon: 'people',
  },
];

const toggleLeftDrawer = () => {
  drawerLeft.value = !drawerLeft.value;
};

const drawerLeft = ref(false);

const rightDrawerOpen = ref(false);

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
}

const miniState = ref(true);

const formatTime = (datetime: Date) => {
  const date = new Date(datetime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const formatDate = (datetime: Date) => {
  const date = new Date(datetime);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().padStart(2, '0');
  return `${day}.${month}.${year}`;
};
</script>
<style lang="scss" scoped>
.card {
  background-color: $primary;
}
</style>
