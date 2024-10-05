<template>
  <q-page v-if="loaded">
    <template v-if="examStore.selectedExam">
      <ViewExam :exam="examStore.selectedExam" />
    </template>
  </q-page>
</template>
<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';
import { Loading } from 'quasar';
import ViewExam from 'src/components/Exams/ViewExam.vue';
import { useRoute } from 'vue-router';
import { useExamStore } from 'src/stores/examStore';

const examStore = useExamStore();
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
  loaded.value = true;
  Loading.hide();
});
</script>

