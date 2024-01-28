<template>
  <q-page v-if="state.loaded">
    <CreateAvailability />
  </q-page>
</template>

<script setup lang="ts">
import { useExamDayStore } from 'src/stores/examDayStore';
import { onMounted, reactive } from 'vue';
import { Loading } from 'quasar';
import CreateAvailability from 'src/components/CreateAvailability.vue';

const examDayStore = useExamDayStore();

const state = reactive({
  loaded: false
});

onMounted(async () => {
  Loading.show({message:'Loading exam days...', spinnerColor: 'amber', messageColor: 'amber', backgroundColor: 'black'});
  await examDayStore.loadExamDays();
  state.loaded = true;
  Loading.hide();
});


</script>
