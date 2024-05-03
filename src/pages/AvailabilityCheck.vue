<template>
  <q-page v-if="state.loaded">
    <CheckList />
  </q-page>
</template>

<script setup lang="ts">
import CheckList from 'src/components/CheckList.vue';
import { onMounted, reactive } from 'vue';
import { useAvailabilityStore } from 'src/stores/availabilityStore';
import { Loading } from 'quasar';

const availabilityStore = useAvailabilityStore();

const state = reactive({
  loaded: false,
});

onMounted(async () => {
  Loading.show({
    message: 'Loading responses...',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  if(availabilityStore.userResponses.length === 0){
    await availabilityStore.loadResponsesForUser();
  }
  state.loaded = true;
  Loading.hide();
});
</script>
