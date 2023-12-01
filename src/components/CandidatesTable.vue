<template>
  <q-table
    :rows="data" :columns="columns"
    :hide-pagination="true"
    :rows-per-page-options="[0]">
      <template v-slot:body-cell-actions="{ row }">
        <q-td>
          <q-btn color="primary" @click="moveToInactive(row)">Move to Inactive</q-btn>
        </q-td>
      </template>
      <template v-slot:body-cell-FirstName="{ row }">
        <q-td >
          <q-input v-model="row.FirstName" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-LastName="{ row }">
        <q-td >
          <q-input v-model="row.LastName" dense class="input-field"  ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Email="{ row }">
        <q-td >
          <q-input v-model="row.Email" dense class="input-field"  ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Phone="{ row }">
        <q-td >
          <q-input v-model="row.Phone" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Location="{ row }">
        <q-td >
          <q-input v-model="row.Location" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-DateOfExam="{ row }">
        <q-td >
          <input type="date" :value="formatDate(row.DateOfExam)" @input="updateExamDate($event, row)" class="input-field">
        </q-td>
      </template>
      <template v-slot:body-cell-TypeOfExam="{ row }">
        <q-td >
          <q-input v-model="row.TypeOfExam" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Partner="{ row }">
        <q-td >
          <q-input v-model="row.Partner" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Mock="{ row }">
        <q-td >
          <q-input v-model="row.Mock" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Requirements="{ row }">
        <q-td >
          <q-input v-model="row.Requirements" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-CrfToSchool="{ row }">
        <q-td >
          <q-input v-model="row.CrfToSchool" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Note="{ row }">
        <q-td >
          <q-input v-model="row.Note" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Code="{ row }">
        <q-td >
          <q-input v-model="row.Code" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-OrderId="{ row }">
        <q-td >
          <q-input v-model="row.OrderId" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Paid="{ row }">
        <q-td >
          <q-input v-model="row.Paid" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-BirthDate="{ row }">
        <q-td >
          <input type="date" :value="formatDate(row.BirthDate)" @input="updateBirthDate($event, row)" class="input-field">
        </q-td>
      </template>
      <template v-slot:body-cell-Level="{ row }">
        <q-td >
          <q-input v-model="row.Level" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-Venue="{ row }">
        <q-td >
          <q-input v-model="row.Venue" dense class="input-field" ></q-input>
        </q-td>
      </template>
      <template v-slot:body-cell-CandidateId="{ row }">
        <q-td >
          <q-input v-model="row.CandidateId" dense class="input-field" ></q-input>
        </q-td>
      </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Candidate } from './models';
import {useCandidateStore} from 'src/stores/candidateStore';

const candidateStore = useCandidateStore();

const data = candidateStore.candidates;

const columns = ref([
  { name: 'actions', required: true, label: 'Actions', align: 'left', field: 'actions' },
  { name: 'id', required: true, label: 'ID', align: 'left', field: 'id' },
  { name: 'BirthDate', required: true, label: 'Birth Date', align: 'left', field: (row: Candidate) => row.BirthDate.toLocaleDateString() },
  { name: 'CandidateId', required: true, label: 'Candidate ID', align: 'left', field: 'CandidateId' },
  { name: 'Code', required: true, label: 'Code', align: 'left', field: 'Code' },
  { name: 'CrfToSchool', required: true, label: 'CRF To School', align: 'left', field: 'CrfToSchool' },
  { name: 'DateOfExam', required: true, label: 'Date Of Exam', align: 'left', field: (row: Candidate) => row.DateOfExam.toLocaleDateString() },
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

const formatDate = (date : any) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

const updateBirthDate = (event: any, row: any) => {
  row.BirthDate = new Date(event.target.value);
}

const updateExamDate = (event: any, row: any) => {
  row.ExamDate = new Date(event.target.value);
}


</script>
<style lang="scss" scoped>
.input-field {
  width: auto;
}

@media (min-width: 600px) {
  .input-field {
    width: 200px;
  }
}

</style>
