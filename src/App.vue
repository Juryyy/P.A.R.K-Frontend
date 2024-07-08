<template>
  <router-view :key="$route.fullPath" v-if="state.isLoaded"/>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { Loading } from 'quasar';

const state = reactive({
  isLoaded: false,
});

const userStore = useUserStore();

onMounted(async () => {
  userStore.getUserInfo();
  if(userStore.user.email !== null){
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
