<template>
  <q-page>
    <template v-if="examStore.selectedExam">
      <ViewExam :exam="examStore.selectedExam" />
    </template>
  </q-page>
</template>
<script setup lang="ts">
import ViewExam from 'src/components/Exams/ViewExam.vue';
import { useExamStore } from 'src/stores/examStore';

const examStore = useExamStore();


</script>

