<template>
  <q-layout view="hHh LpR fff">
    <q-header elevated class="bg-primary text-dark ">
      <q-toolbar>
        <q-btn class="q-mini-drawer-only" dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title >
          P.A.R.K Admin
        </q-toolbar-title>
          <b>{{user?.firstName}} {{user?.lastName}}</b>
        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
        <q-btn icon="logout" flat round @click="logout" />
      </q-toolbar>
    </q-header>
    <div v-if="user">
    <q-drawer show-if-above v-model="drawerLeft" side="left" elevated
    :mini="miniState"
    @mouseover="miniState = false"
    @mouseout="miniState = true"
    mini-to-overlay>
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
        <q-separator color="primary" spaced="8px" v-if="user.role === 'Office' " />
        <q-list v-if="user.role === 'Office' ">
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
      <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
        <div class="bg-transparent absolute-center">
          <q-avatar size="56px" class="q-mb-sm">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png">
          </q-avatar>
          <div class="text-weight-bold">{{user?.firstName}} {{user?.lastName}}</div>
          <div>{{user?.role}}</div>
        </div>

      </q-img>

        <div class="absolute-bottom">
          <a href="https://www.zkouskypark.cz/" target="_blank" rel="noopener noreferrer">
        <img src="https://www.zkouskypark.cz/www/upload/logo/20210118070023666.png" class="logo"/>
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
import { computed, ref } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/Auth_nav/EssentialLink.vue';
import { useUserStore } from 'src/stores/userStore';
import { useAuthStore } from 'src/stores/authStore';
import { router } from 'src/router/index';

const userStore = useUserStore();
const authStore = useAuthStore();

const logout = async () => {
  await authStore.logout();
  router.push('/login');
};

const user = computed(() => userStore.user);

const essentialLinks : EssentialLinkProps[] = [
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
    title: 'Exams',
    link: '/exams',
    icon: 'assignment',
  }
];

const adminEssentialLinks : EssentialLinkProps[] =[
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
]

const toggleLeftDrawer = () => {
  drawerLeft.value = !drawerLeft.value;
};

const drawerLeft = ref(false)

const rightDrawerOpen = ref(false)

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

const miniState = ref(true)

</script>
<style lang="scss" scoped>

</style>
