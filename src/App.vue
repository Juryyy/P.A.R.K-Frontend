<template>
  <div>
    <router-view v-if="state.isLoaded" :key="$route.fullPath" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { useAuthStore } from './stores/authStore';
import { Loading, Notify } from 'quasar';
import { useRouter } from 'vue-router';

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
    Loading.show({
      message: 'Loading data...',
      spinnerColor: 'amber',
      messageColor: 'amber',
      backgroundColor: 'black',
    });

    state.error = null;
    state.isLoaded = false;

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      state.isLoaded = true;
      return;
    }else{
      await authStore.getToken();
    }

    try {
      const user = userStore.getUserInfo();
      console.log(user);

      if (!user.email) {
        router.push('/login');
        state.isLoaded = true;
        return;
      }

      await Promise.all([
        userStore.getUsersExams(),
        userStore.getUsersAvatar()
      ]);

    } catch (error) {
      try {
        await authStore.getToken();
        userStore.getUserInfo();

        await Promise.all([
          userStore.getUsersExams(),
          userStore.getUsersAvatar()
        ]);
      } catch (refreshError) {
        router.push('/login');
        throw refreshError;
      }
    }

    state.isLoaded = true;
  } catch (error: any) {
    console.error(error);
    state.error = 'Failed to load application data. Please try again.';
    if(state.hasFailed){
      Notify.create({
        color: 'negative',
        message: 'Failed to initialize application, if the problem persists please contact us.',
        position: 'bottom',
        icon: 'report_problem',
      });
    }
    state.hasFailed = true;
    initializeApp();
  } finally {
    Loading.hide();
  }
};

onMounted(initializeApp);
</script>
