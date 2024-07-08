<template>
  <q-page>
    <UserInfo v-if="state.loaded && user" :user="user" :user-avatar="userAvatar" />
  </q-page>
</template>


<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onBeforeMount, onUnmounted, reactive, onMounted } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { Loading, Dialog } from 'quasar';
import UserInfo from 'src/components/Users/UserInfo.vue';
import { User } from 'src/stores/db/types';

const userStore = useUserStore();

const route = useRoute();
const userId = ref(route.params.id);
const user = ref<User | null>(null);
const userAvatar = ref<string | null>(null);

const state = reactive({
  loaded: false,
});

onMounted(async () => {
  try {
    if (isNaN(Number(userId.value))) {
      throw new Error('Invalid User ID');
    }

    Loading.show({
      message: 'Loading user profile',
      spinnerColor: 'amber',
      messageColor: 'amber',
      backgroundColor: 'black',
    });

    await userStore.getProfile(Number(userId.value));
    await userStore.getUserAvatarById(Number(userId.value));

    user.value = userStore.selectedUser;
    userAvatar.value = userStore.selectedUserAvatar;
  } catch (error: unknown) {
    if (error instanceof Error) {
      Dialog.create({
        title: 'Error',
        message: error.message,
        persistent: true,
        ok: 'OK',
      });
    }
  } finally {
    state.loaded = true;
    Loading.hide();
  }
});

onUnmounted(() => {
  userStore.clearSelectedUserInfo();
});
</script>
