<template>
    <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUserStore } from 'src/stores/userStore';

const userStore = useUserStore();

onMounted(() => {
  userStore.getUserInfo();
});
</script>
