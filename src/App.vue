<template>
  <router-view :key="$route.fullPath" v-if="state.isLoaded" />
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { Loading } from 'quasar';

const userStore = useUserStore();
const state = reactive({
  isLoaded: false,
});

onMounted(async () => {
  if (userStore.user.email || localStorage.getItem('email')) {
    await userStore.fetchUserInfo();
    userStore.updateUserInfo(userStore.user);
    userStore.getUserInfo();
    Loading.show({
      message: 'Loading data...',
      spinnerColor: 'amber',
      messageColor: 'amber',
      backgroundColor: 'black',
    });
    state.isLoaded = false;
    await userStore.getUsersExams();
    await userStore.getUsersAvatar();
  }
  state.isLoaded = true;
  Loading.hide();
});
</script>
