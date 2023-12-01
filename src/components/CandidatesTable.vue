<template>
  <div >
  <q-table
    :rows="data" :columns="columns"
    :hide-pagination="true"
    :rows-per-page-options="[0]">
      <template v-slot:body-cell-actions="{ row }">
        <q-td>
          <q-btn color="primary" @click="moveToInactive(row)">Move to Inactive</q-btn>
        </q-td>
      </template>
  </q-table>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Candidate } from './models';
import {useCandidateStore} from 'src/stores/candidateStore';

const candidateStore = useCandidateStore();

const data = candidateStore.candidates;

if(!data) throw new Error('No data');

const columns = ref([
  { name: 'actions', required: true, label: 'Actions', align: 'left', field: 'actions' },
  { name: 'id', required: true, label: 'ID', align: 'left', field: 'id' },
  { name: 'BirthDate', required: true, label: 'Birth Date', align: 'left', field: 'BirthDate' },
  { name: 'CandidateId', required: true, label: 'Candidate ID', align: 'left', field: 'CandidateId' },
  { name: 'Code', required: true, label: 'Code', align: 'left', field: 'Code' },
  { name: 'CrfToSchool', required: true, label: 'CRF To School', align: 'left', field: 'CrfToSchool' },
  { name: 'DateOfExam', required: true, label: 'Date Of Exam', align: 'left', field: 'DateOfExam' },
  { name: 'Email', required: true, label: 'Email', align: 'left', field: 'Email' },
  { name: 'FirstName', required: true, label: 'First Name', align: 'left', field: 'FirstName' },
  { name: 'LastName', required: true, label: 'Last Name', align: 'left', field: 'LastName' },
  { name: 'Level', required: true, label: 'Level', align: 'left', field: 'Level' },
  { name: 'Location', required: true, label: 'Location', align: 'left', field: 'Location' },
  { name: 'Mock', required: true, label: 'Mock', align: 'left', field: 'Mock' },
  { name: 'Note', required: true, label: 'Note', align: 'left', field: 'Note' },
  { name: 'OrderId', required: true, label: 'Order ID', align: 'left', field: 'OrderId' },
  { name: 'Paid', required: true, label: 'Paid', align: 'left', field: 'Paid' },
  { name: 'Partner', required: true, label: 'Partner', align: 'left', field: 'Partner' },
  { name: 'Phone', required: true, label: 'Phone', align: 'left', field: 'Phone' },
  { name: 'Requirements', required: true, label: 'Requirements', align: 'left', field: 'Requirements' },
  { name: 'TypeOfExam', required: true, label: 'Type Of Exam', align: 'left', field: 'TypeOfExam' },
  { name: 'Venue', required: true, label: 'Venue', align: 'left', field: 'Venue' },
] as { name: string; required: boolean; label: string; align: 'left'; field: string | ((row: Candidate) => Candidate); }[]);

const inactiveRows = ref<Candidate[]>([]);

const moveToInactive = (row: Candidate) => {
  inactiveRows.value.push(row);
  candidateStore.removeCandidate(row);
};
</script>
