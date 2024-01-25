<template>
  <div class="text-h4 flex-center">Upcoming exams</div>
    <q-page class="flex-center">
    <template v-if="!state.isLoaded">
      <div>Loading</div>
    </template>
    <template v-if="state.isLoaded">
      <!--<ExamList/>-->
      <ExamListCal/>
    </template>
  </q-page>
</template>
<script setup lang="ts">
import ExamListCal from 'src/components/Exams/ExamListCal.vue';
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
<style lang="scss" scoped>
</style>

