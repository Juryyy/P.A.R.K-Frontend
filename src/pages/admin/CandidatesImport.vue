<template>
  <q-page class="flex flex-center">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-subtitle2">Upload a CSV file to import candidates</div>
      </q-card-section>
      <q-card-actions>
        <FileReadCsv v-if="!candidateStore.isImported" />
        <q-btn v-else color="primary" label="Reset" @click="Reset" />
      </q-card-actions>
    </q-card>

    <CandidatesTable v-if="candidateStore.isImported" />
  </q-page>
</template>

<script setup lang="ts">
import FileReadCsv from 'src/components/FileRead/FileReadCsv.vue';
import CandidatesTable from 'src/components/CandidatesTable.vue';
import { useCandidateStore } from 'src/stores/candidateStore';

const candidateStore = useCandidateStore();

const Reset = () => {
  candidateStore.candidates.splice(0, candidateStore.candidates.length);
  candidateStore.isImported = false;
};
</script>

<style lang="scss" scoped>
.my-card {
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
