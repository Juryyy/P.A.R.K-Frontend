<template>
  <q-page v-if="loaded">
    <UserList />
  </q-page>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useAdminStore } from 'src/stores/adminStore';
import { Loading } from 'quasar';
import UserList from 'src/components/Users/UserList.vue';

const adminStore = useAdminStore();

const loaded = ref(false);

onBeforeMount(async () => {
  Loading.show({
    message: 'Loading users',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  loaded.value = false;
  await adminStore.getAllUsers();
  loaded.value = true;
  Loading.hide();
});
</script>
