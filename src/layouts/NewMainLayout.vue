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
          <q-avatar size="46px" class="q-pr-xl">
            <img :src="userAvatar" alt="User Avatar" />
          </q-avatar>
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
            v-if="user?.role?.includes('Office')"
          />
          <q-list v-if="user?.role?.includes('Office')">
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
            <div>
              <q-badge
                v-for="role in user?.role"
                :key="role"
                :color="getRoleColor(role as RoleEnum)"
                class="q-mr-sm q-mb-sm"
                :label="role"
              />
            </div>
          </div>
        </q-img>

        <q-card-section class="q-pa-md">
          <q-card
            class="card q-mb-sm"
            bordered
            v-for="exam in usersExamsRef"
            :key="exam.id"
          >
            <q-card-section>
              <q-item-label>
                Location: <b>{{ exam.location }}</b>
              </q-item-label>

              <q-item-label>
                Venue: <b>{{ exam.venue }}</b>
              </q-item-label>
              <q-item-label>
                Date: <b>{{ formatDate(exam.startTime) }} </b>
              </q-item-label>
              <q-item-label>
                Time:
                <b>
                  {{
                    formatTime(exam.startTime) +
                    ' - ' +
                    formatTime(exam.endTime)
                  }}
                </b>
              </q-item-label>
              <q-item-label>
                Type: <b>{{ exam.type }}</b>
              </q-item-label>
              <q-item-label>
                Note: <b>{{ exam.note }}</b>
              </q-item-label>
              <q-item-label class="absolute-top-right q-ma-sm">
                <q-btn
                  class="q-mr-xs"
                  color="secondary"
                  label="View"
                  @click="() => {
                    router.push(`/exams/${exam.id}`)
                }"
                />
                <q-btn
                  color="secondary"
                  icon="map"
                  @click="showVenue(exam.venueLink)"
                />
              </q-item-label>
            </q-card-section>
          </q-card>
        </q-card-section>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/Auth_nav/EssentialLink.vue';
import { useUserStore } from 'src/stores/userStore';
import { useAuthStore } from 'src/stores/authStore';
import { router } from 'src/router/index';
import { ExamWithVenueLink, RoleEnum } from 'src/stores/db/types';
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
  usersExamsRef.value = userStore.usersExams;
  userAvatar.value = userStore.userAvatar;
  Loading.hide();
});

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

const exams: ExamWithVenueLink[] = userStore.usersExams;
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
  {
    title: 'Users',
    link: '/users',
    icon: 'people',
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
    title: 'Admin Panel',
    link: '/admin-panel',
    icon: 'admin_panel_settings',
  },
];

const toggleLeftDrawer = () => {
  drawerLeft.value = !drawerLeft.value;
};

const drawerLeft = ref(false);

const rightDrawerOpen = ref(false);

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value;
  console.log(usersExamsRef.value);
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

const showVenue = (gLink: string) => {
  window.open(gLink, '_blank');
};

function getRoleColor(role: RoleEnum): string {
  switch (role) {
    case RoleEnum.Office:
      return 'primary';
    case RoleEnum.Supervisor:
      return 'secondary';
    case RoleEnum.SeniorSupervisor:
      return 'accent';
    case RoleEnum.Invigilator:
      return 'positive';
    case RoleEnum.SeniorInvigilator:
      return 'negative';
    case RoleEnum.Tech:
      return 'info';
    case RoleEnum.Examiner:
      return 'warning';
    default:
      return 'grey';
  }
}
</script>

<style lang="scss" scoped>
.card {
  background-color: $primary;
}
</style>


<style lang="scss" scoped>
.card {
  background-color: $primary;
}
</style>
