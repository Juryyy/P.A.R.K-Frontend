<template>
  <q-layout view="hHh LpR fff">
    <q-header elevated class="bg-primary text-dark ">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <q-toolbar-title >
          P.A.R.K Admin
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
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

        <a href="https://www.zkouskypark.cz/" target="_blank" rel="noopener noreferrer">
          <img src="https://www.zkouskypark.cz/www/upload/logo/20210118070023666.png" class="logo"/>
          </a>
      </div>
    </q-drawer>

    <q-drawer show-if-above v-model="rightDrawerOpen" side="right" bordered>
      <q-img class="absolute-top" src="https://cdn.quasar.dev/img/material.png" style="height: 150px">
        <div class="bg-transparent absolute-center">
          <q-avatar size="56px" class="q-mb-sm">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png">
          </q-avatar>
          <div class="text-weight-bold">Martin Šulc</div>
          <div>Examiner</div>
        </div>
      </q-img>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>


  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/EssentialLink.vue';

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
    title: 'Import Candidates',
    link: '/import-candidates',
    icon: 'cloud_upload',
  },
  {
    title: 'Test - 404',
    link: '/test',
    icon: 'settings',
  },
];

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const rightDrawerOpen = ref(false)

function toggleRightDrawer() {
  rightDrawerOpen.value = !rightDrawerOpen.value
}

</script>
<style lang="scss" scoped>
.drawer-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

</style>
