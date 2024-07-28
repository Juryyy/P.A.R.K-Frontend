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
        <div v-if="!rightDrawerOpen" class="q-gutter-md row items-center">
          <q-avatar size="46px" class="q-pr-xl clickable-avatar" @click="viewUser(user)">
            <img :src="userAvatar" alt="User Avatar" />
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
            v-if="user?.role?.includes('Office') || user?.role?.includes('Developer')"
          />
          <q-list v-if="user?.role?.includes('Office') || user?.role?.includes('Developer')">
            <essential-link
              v-for="link in adminEssentialLinks"
              :key="link.title"
              :title="link.title"
              :link="`/admin/${link.link}`"
              :icon="link.icon"
            />
          </q-list>
        </div>
      </q-drawer>
    </div>
    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" elevated>
      <q-scroll-area class="fit">
        <q-img src="/background.jpg" style="height: 150px">
          <div class="bg-transparent absolute-center q-pa-md drawer-avatar-box">
            <q-avatar size="80px" class="q-mr-md clickable-avatar" @click="viewUser(user)">
              <img :src="userAvatar" alt="User Avatar" />
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

        <q-card-section class="q-pa-md">
         <q-card
          :class="exam.isPrepared ? 'isPrepared' : 'isNotPrepared'"
          bordered
          v-for="exam in usersExamsRef"
          :key="exam.id"
          >
            <q-card-section>
              <q-item-label>Location: <b>{{ exam.location }}</b></q-item-label>
              <q-item-label>Venue: <b>{{ exam.venue }}</b></q-item-label>
              <q-item-label>Date: <b>{{ formatDateString(exam.startTime) }} </b></q-item-label>
              <q-item-label>
                Time:
                <b>
                  {{ formatTimeString(exam.startTime) + ' - ' + formatTimeString(exam.endTime) }}
                </b>
              </q-item-label>
              <q-item-label>Type: <b>{{ exam.type }}</b></q-item-label>
              <q-item-label>
                Note:
                <b v-if="shouldShowMoreLink(exam.note)" @click="showFullNoteDialog()">
                  {{ truncatedNote(exam.note) }}
                  <span class="more-link">...more</span>
                </b>
                <b v-else>
                  <b>{{ exam.note }}</b>
                </b>
              </q-item-label>
              <q-item-label>
              <q-dialog v-model="showNoteDialog">
                <q-card class="note-dialog-card">
                  <q-card-section>
                    <div class="text-h6">Full Note</div>
                    <div class="note-content">{{ exam?.note }}</div>
                  </q-card-section>
                  <q-card-actions align="right">
                    <q-btn color="primary" label="Close" @click="showNoteDialog = false" />
                  </q-card-actions>
                </q-card>
              </q-dialog>
              </q-item-label>
              <q-item-label class="absolute-top-right q-ma-sm">
                <q-btn
                  class="q-mr-xs"
                  color="secondary"
                  label="View"
                  @click="() => {
                    router.push(`/exams/${exam.id}`);
                  }"
                />
                <q-btn color="secondary" icon="map" @click="showVenue(exam.venueLink)" />
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
import { computed, onBeforeMount, ref, nextTick } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/Auth_nav/EssentialLink.vue';
import { useUserStore } from 'src/stores/userStore';
import { useAuthStore } from 'src/stores/authStore';
import { router } from 'src/router/index';
import { ExamWithVenueLink, RoleEnum } from 'src/stores/db/types';
import { Loading } from 'quasar';
import { getRoleColor } from 'src/helpers/Color';
import { sortRoles } from 'src/helpers/FormatRole';
import { formatDateString, formatTimeString } from 'src/helpers/FormatTime';

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
const showNoteDialog = ref(false);

const shouldShowMoreLink = (note: string | undefined) => {
  const maxLength = 19;
  return note && note.length > maxLength;
};

const showFullNoteDialog = () => {
  showNoteDialog.value = true;
};

const truncatedNote = (note: string | undefined) => {
  const maxLength = 19;
  if (note && note.length > maxLength) {
    return `${note.substring(0, maxLength)}`;
  }
  return note;
};

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
    link: 'import-candidates',
    icon: 'cloud_upload',
  },
  {
    title: 'Create Availability',
    link: 'create-availability',
    icon: 'event_note',
  },
  {
    title: 'Exams',
    link: 'exams',
    icon: 'assignment',
  },
  {
    title: 'Admin Panel',
    link: 'admin-panel',
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

const viewUser = async (user: any) => {
  await nextTick();
  router.push(`/user/${user.id}`);
};
</script>

<style lang="scss" scoped>
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
</style>
