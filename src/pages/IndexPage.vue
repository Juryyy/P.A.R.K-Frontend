<template>
  <q-page class="row justify-evenly">
    <template v-if="state.isLoaded">
      <PostsComponent />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import PostsComponent from 'components/PostsComponent.vue';
import { ref, onMounted, reactive } from 'vue';
import { usePostStore } from 'src/stores/postStore';
import { useUserStore } from 'src/stores/userStore';
import { Loading } from 'quasar';

const postStore = usePostStore();
const userStore = useUserStore();

const state = reactive({
  isLoaded: false,
});

onMounted(async () => {
  state.isLoaded = false;
  Loading.show({
    message: 'Loading posts...',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  await postStore.getPosts();
  await userStore.getAllUsers();
  Loading.hide();
  state.isLoaded = true;
});
</script>
