<template>
    <q-card class="my-card">
      <q-card-section>
        <div class="text-subtitle2">Upload a CSV file to import candidates</div>
      </q-card-section>

      <q-separator />

      <q-card-actions>
        <FileReadCsv/>
      </q-card-actions>
    </q-card>

    <CandidatesTable v-if="candidateStore.isImported"/>

</template>

<script setup lang="ts">
import FileReadCsv from 'src/components/FileReadCsv.vue';
import CandidatesTable from 'src/components/CandidatesTable.vue';
import {useCandidateStore} from 'src/stores/candidateStore';

const candidateStore = useCandidateStore();


</script>



<style lang="scss" scoped>
.my-card{
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
