<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          P.A.R.K App
        </q-toolbar-title>


      </q-toolbar>
    </q-header>

    <q-drawer
    v-model="leftDrawerOpen"
    bordered
  >
    <div class="drawer-content">
      <q-list>
        <q-item-label
          header
        >
          Menu
        </q-item-label>

        <q-item to="/test">
          <q-item-section>
            <q-item-label>
              <q-icon name="settings" />
              Test

            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item to="availabilty-check">
          <q-item-section>
            <q-item-label>
              <q-icon name="calendar_today" />
              Availability
            </q-item-label>
          </q-item-section>
        </q-item>


      </q-list>




      <img src="https://www.zkouskypark.cz/www/upload/logo/20210118070023666.png" class="logo" />
    </div>
  </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import EssentialLink, { EssentialLinkProps } from 'components/EssentialLink.vue';

const essentialLinks: EssentialLinkProps[] = [
  {title: 'Home', caption: 'Home page', icon: 'home'},
  {title: 'Create term', caption: 'Create new term', icon: 'add'},
  {title: 'Availability', caption: 'Check availability', icon: 'calendar_today', link: '/availability-check'},
];

const leftDrawerOpen = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>
<style scoped>
.drawer-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
}

.logo {
  align-self: center;
}

</style>

