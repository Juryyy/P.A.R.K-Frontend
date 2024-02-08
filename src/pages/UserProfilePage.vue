<template>
  <q-page>
    <UserInfo :user="user" :user-avatar="userAvatar" v-if="state.loaded" />
  </q-page>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onBeforeMount, onUnmounted, reactive } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { Loading, Dialog } from 'quasar';
import UserInfo from 'src/components/Users/UserInfo.vue';

const userStore = useUserStore();

const route = useRoute();
const userId = ref(route.params.id);
const user = ref(userStore.selectedUser);
const userAvatar = ref(userStore.selectedUserAvatar);

const state = reactive({
  loaded: false,
});

onBeforeMount(async () => {
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
