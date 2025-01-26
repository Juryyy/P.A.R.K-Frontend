<template>
  <router-view :key="$route.fullPath" v-if="state.isLoaded" />
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { Loading } from 'quasar';
import { useAuthStore } from './stores/authStore';

const userStore = useUserStore();
const authStore = useAuthStore();
const state = reactive({
  isLoaded: false,
});

onMounted(async () => {
  if (userStore.user.email || localStorage.getItem('token')) {
    await authStore.getToken();
    userStore.getUserInfo();
    Loading.show({
      message: 'Loading data...',
      spinnerColor: 'amber',
      messageColor: 'amber',
      backgroundColor: 'black',
    });
    state.isLoaded = false;
    console.log(userStore.user.activatedAccount)
    await userStore.getUsersExams();
    await userStore.getUsersAvatar();
  }
  state.isLoaded = true;
  Loading.hide();
});
</script>
