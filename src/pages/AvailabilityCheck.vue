<template>
<q-page-container v-if="state.loaded">
  <CheckList />
</q-page-container>
</template>

<script setup lang="ts">
import CheckList from 'src/components/CheckList.vue';
import { onMounted, reactive } from 'vue';
import { useAvailabilityStore } from 'src/stores/availabilityStore';

const availabilityStore = useAvailabilityStore();

const state = reactive({
  loaded: false
});

onMounted(async () => {
  await availabilityStore.loadResponsesForUser();
  state.loaded = true;
});
</script>
