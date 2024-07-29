<template>
  <q-page v-if="loaded">
    <template v-if="examStore.selectedExam">
      <EditExam :exam="examStore.selectedExam" :responses="examDayStore.responsesForExamDay" />
    </template>
  </q-page>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { Loading } from 'quasar';
import EditExam from 'src/components/Exams/EditExam.vue';
import { useAdminStore } from 'src/stores/adminStore';
import { useRoute } from 'vue-router';
import { useExamStore } from 'src/stores/examStore';
import { useExamDayStore } from 'src/stores/examDayStore';

const userStore = useUserStore();
const adminStore = useAdminStore();
const examStore = useExamStore();
const examDayStore = useExamDayStore();
const route = useRoute();

const exam = ref(route.params.id)

const loaded = ref(false);

onBeforeMount(async () => {
  Loading.show({
    message: 'Loading exam and responses',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  loaded.value = false;
  await examStore.getExam(Number(exam.value));
  if (examStore.selectedExam) {
    await examDayStore.loadResponsesForExamDay(Number(examStore.selectedExam.dayOfExamsId));
  }
  loaded.value = true;
  Loading.hide();
});
</script>

