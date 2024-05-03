<template>
  <router-view :key="$route.fullPath" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from 'src/stores/userStore';

const userStore = useUserStore();

onMounted(async () => {
  userStore.getUserInfo();
  if(userStore.user.email !== null){
    await userStore.getUsersExams();
    await userStore.getUsersAvatar();
  }
});
</script>
