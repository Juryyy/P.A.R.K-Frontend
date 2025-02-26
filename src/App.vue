<template>
  <div>
    <router-view v-if="state.isLoaded" :key="$route.fullPath" />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { useAuthStore } from './stores/authStore';
import { useRouter } from 'vue-router';
import { LoadingService } from './utils/services/loadingService';
import { NotificationService } from './utils/services/notificationService';

const userStore = useUserStore();
const authStore = useAuthStore();
const router = useRouter();

const state = reactive({
  isLoaded: false,
  error: null as string | null,
  hasFailed: false,
});

const initializeApp = async () => {
  try {
    LoadingService.show('Loading data...');
    state.error = null;
    state.isLoaded = false;

    const token = localStorage.getItem('token');

    if (!token) {
      state.isLoaded = true;
      router.push('/login');
      return;
    }

    try {
      const user = userStore.getUserInfo();

      if (!user.email) {
        const tokenResult = await authStore.getToken();
        if (!tokenResult.success) {
          router.push('/login');
          state.isLoaded = true;
          return;
        }

        userStore.getUserInfo();
      }

      await Promise.all([
        userStore.getUsersExams(),
        userStore.getUsersAvatar()
      ]);

      state.isLoaded = true;
    } catch (error) {
      try {
        const tokenResult = await authStore.getToken();
        if (!tokenResult.success) {
          router.push('/login');
          state.isLoaded = true;
          return;
        }

        userStore.getUserInfo();
        await Promise.all([
          userStore.getUsersExams(),
          userStore.getUsersAvatar()
        ]);

        state.isLoaded = true;
      } catch (refreshError) {
        router.push('/login');
        throw refreshError;
      }
    }
  } catch (error: any) {
    console.error(error);
    state.error = 'Failed to load application data. Please try again.';
    if (state.hasFailed) {
      NotificationService.error('Failed to initialize application, if the problem persists please contact us.');
    }
    state.hasFailed = true;
    state.isLoaded = true;
    router.push('/login');
  } finally {
    LoadingService.hide();
  }
};

initializeApp();
