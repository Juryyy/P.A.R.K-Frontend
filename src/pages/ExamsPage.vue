<template>
  <q-page class="row items-center justify-evenly " >
    <div class="text-h4">Upcoming exams</div>
    <template v-if="!state.isLoaded">
      <div>Loading</div>
    </template>
    <template v-if="state.isLoaded">
      <ExamList/>
    </template>
  </q-page>
</template>
<script setup lang="ts">
import ExamList from 'src/components/Exams/ExamList.vue';
import { onMounted, reactive } from 'vue';
import { useExamDayStore } from 'src/stores/examDayStore';
import { Loading } from 'quasar';
import { useExamStore } from 'src/stores/examStore';

const examDayStore = useExamDayStore();
const examStore = useExamStore();

const state = reactive({
  isLoaded: false,
});

onMounted(async () => {
  Loading.show({message:'Loading exam days...', spinnerColor: 'amber', messageColor: 'amber', backgroundColor: 'black'});
  await examDayStore.loadExamDays();
  Loading.show({message:'Loading upcoming exams...', spinnerColor: 'amber', messageColor: 'amber', backgroundColor: 'black'});
  await examStore.loadUpcomingExams();
  state.isLoaded = true;
  Loading.hide();
});
</script>


