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
import { onMounted, reactive } from 'vue';
import { Loading, Dialog } from 'quasar';
import { useSubstitutionStore } from 'src/stores/substitutionStore';

const examStore = useExamStore();
const substituteStore = useSubstitutionStore();

onMounted(async () => {
  Loading.show({
    message: 'Loading exam data',
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  });
  try {
    if (examStore.selectedExam) {
      await substituteStore.loadSubsForExam(examStore.selectedExam.id);
    }
  } catch (error) {
    Dialog.create({
      title: 'Error',
      message: 'Failed to load exam data',
      persistent: true,
      ok: true,
      color: 'red',
    });
  }
});
</script>
