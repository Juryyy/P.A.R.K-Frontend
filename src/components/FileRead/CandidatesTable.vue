<template>
  <div id="q-app">
    <div class="q-pa-sm q-gutter-sm">
      <q-table
        class="my-sticky-header-table"
        flat
        bordered
        title="Candidates"
        :rows="data"
        :columns="columns"
        row-key="id"
        binary-state-sort
        :rows-per-page-options="[0]"
        :hide-pagination="true"
        virtual-scroll
      >
        <template v-slot:bottom>
          <q-btn
            flat
            outline
            dense
            color="black"
            label="Add row"
            @click="show_dialog = true"
          ></q-btn>
          <q-dialog v-model="show_dialog">
            <q-card>
              <h3 class="q-pa-sm">TODO - Add form here</h3>
            </q-card>
          </q-dialog>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <!-- <q-td key="id" :props="props">
            {{ props.row.id }}
            <q-popup-edit v-model="props.row.id">
              <q-input v-model="props.row.id" dense autofocus counter></q-input>
            </q-popup-edit>
          </q-td>
          -->
            <q-td key="firstName" :props="props">
              {{ props.row.firstName }}
              <q-popup-edit v-model="props.row.firstName">
                <q-input
                  v-model="props.row.firstName"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="lastName" :props="props">
              {{ props.row.lastName }}
              <q-popup-edit v-model="props.row.lastName">
                <q-input
                  v-model="props.row.lastName"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="birthDate" :props="props">
              {{ props.row.birthDate.toLocaleDateString() }}
              <q-popup-edit v-model="props.row.birthDate">
                <q-input
                  v-model="props.row.birthDate"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="email" :props="props">
              {{ props.row.email }}
              <q-popup-edit v-model="props.row.email">
                <q-input
                  v-model="props.row.email"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="code" :props="props">
              {{ props.row.code }}
              <q-popup-edit v-model="props.row.code">
                <q-input
                  v-model="props.row.code"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="phone" :props="props">
              {{ props.row.phone }}
              <q-popup-edit v-model="props.row.phone">
                <q-input
                  v-model="props.row.phone"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="location" :props="props">
              {{ props.row.location }}
              <q-popup-edit v-model="props.row.location">
                <q-input
                  v-model="props.row.location"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="level" :props="props">
              {{ props.row.level }}
              <q-popup-edit v-model="props.row.level">
                <q-input
                  v-model="props.row.level"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="typeOfExam" :props="props">
              {{ props.row.typeOfExam }}
              <q-popup-edit v-model="props.row.typeOfExam">
                <q-input
                  v-model="props.row.typeOfExam"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="venue" :props="props">
              {{ props.row.venue }}
              <q-popup-edit v-model="props.row.venue">
                <q-input
                  v-model="props.row.venue"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="dateOfExam" :props="props">
              {{ props.row.dateOfExam.toLocaleDateString() }}
              <q-popup-edit v-model="props.row.dateOfExam">
                <q-input
                  v-model="props.row.dateOfExam"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="crfToSchool" :props="props">
              {{ props.row.crfToSchool }}
              <q-popup-edit v-model="props.row.crfToSchool">
                <q-input
                  v-model="props.row.crfToSchool"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="requirements" :props="props">
              {{ props.row.requirements }}
              <q-popup-edit v-model="props.row.requirements">
                <q-input
                  v-model="props.row.requirements"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="mock" :props="props">
              {{ props.row.mock }}
              <q-popup-edit v-model="props.row.mock">
                <q-input
                  v-model="props.row.mock"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="paid" :props="props">
              {{ props.row.paid }}
              <q-popup-edit v-model="props.row.paid">
                <q-input
                  v-model="props.row.paid"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="note" :props="props">
              {{ props.row.note }}
              <q-popup-edit v-model="props.row.note">
                <q-input
                  v-model="props.row.note"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="partner" :props="props">
              {{ props.row.partner }}
              <q-popup-edit v-model="props.row.partner">
                <q-input
                  v-model="props.row.partner"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="orderId" :props="props">
              {{ props.row.orderId }}
              <q-popup-edit v-model="props.row.orderId">
                <q-input
                  v-model="props.row.orderId"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <!-- Add more columns here -->
            <q-td key="actions" :props="props">
              <q-btn
                color="blue"
                label="update"
                @click="editItem(props.row)"
                size="sm"
              ></q-btn>
              <q-btn
                color="red"
                label="delete"
                @click="deleteItem(props.row)"
                size="sm"
              ></q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:top>
          <q-btn
            flat
            outline
            dense
            color="black"
            label="Upload"
            @click="upload"
          ></q-btn>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Candidate } from './models';
import { useCandidateStore } from '../../stores/candidateStore';
import { Dialog, Loading } from 'quasar';

const candidateStore = useCandidateStore();

const data = candidateStore.candidates;

const columns = [
  //{ name: 'id', required: true, label: 'ID', align: 'left', field: 'id' },
  {
    name: 'firstName',
    required: true,
    label: 'First Name',
    align: 'left',
    field: 'firstName',
  },
  {
    name: 'lastName',
    required: true,
    label: 'Last Name',
    align: 'left',
    field: 'lastName',
  },
  {
    name: 'birthDate',
    required: true,
    label: 'Birth Date',
    align: 'left',
    field: (row: Candidate) => row.birthDate.toLocaleDateString(),
  },
  {
    name: 'email',
    required: true,
    label: 'Email',
    align: 'left',
    field: 'email',
  },
  { name: 'code',
    required: true,
    label: 'Code',
    align: 'left',
    field: 'code' },
  {
    name: 'phone',
    required: true,
    label: 'Phone',
    align: 'left',
    field: 'phone',
  },
  {
    name: 'location',
    required: true,
    label: 'Location',
    align: 'left',
    field: 'location',
  },
  {
    name: 'level',
    required: true,
    label: 'Level',
    align: 'left',
    field: 'level',
  },
  {
    name: 'typeOfExam',
    required: true,
    label: 'Type Of Exam',
    align: 'left',
    field: 'typeOfExam',
  },
  {
    name: 'dateOfExam',
    required: true,
    label: 'Date Of Exam',
    align: 'left',
    field: (row: Candidate) => row.dateOfExam.toLocaleDateString(),
  },
  {
    name: 'crfToSchool',
    required: true,
    label: 'CRF To School',
    align: 'left',
    field: 'crfToSchool',
  },
  {
    name: 'requirements',
    required: true,
    label: 'Requirements',
    align: 'left',
    field: 'requirements',
  },
  { name: 'mock',
    required: true,
    label: 'Mock',
    align: 'left',
    field: 'mock'
  },
  {
    name: 'paid',
    required: true,
    label: 'Paid',
    align: 'left',
    field: 'paid'
  },
  {
    name: 'note',
    required: true,
    label: 'Note',
    align: 'left',
    field: 'note'
  },
  {
    name: 'partner',
    required: true,
    label: 'Partner',
    align: 'left',
    field: 'partner',
  },
  {
    name: 'orderId',
    required: true,
    label: 'Order ID',
    align: 'left',
    field: 'orderId',
  },
  {
    name: 'actions',
    required: true,
    label: 'Actions',
    align: 'left',
    field: 'actions',
  },
] as {
  name: string;
  required: boolean;
  label: string;
  align: 'left';
  field: string | ((row: Candidate) => Candidate);
}[];

const inactiveRows = ref<Candidate[]>([]);

const editedIndex = ref(-1);
const editedItem = ref({} as Candidate);

const editItem = (item: Candidate) => {
  editedIndex.value = data.indexOf(item);
  editedItem.value = Object.assign({}, item);
  console.log(editedItem.value);
  console.log(data);
};

const show_dialog = ref(false);

const deleteItem = (item: Candidate) => {
  Dialog.create({
    title: 'Confirm',
    message: 'Are you sure you want to delete this item?',
    ok: {
      label: 'Yes',
      color: 'positive',
    },
    cancel: {
      label: 'No',
      color: 'negative',
    },
  }).onOk(() => {
    inactiveRows.value.push(item);
    candidateStore.removeCandidate(item);
  });
};

const upload = async () => {
  Loading.show({
      message: 'Uploading candidates',
      spinnerColor: 'amber',
      messageColor: 'amber',
      backgroundColor: 'black',
    });
  await candidateStore.uploadCandidates();
  candidateStore.candidates.splice(0, candidateStore.candidates.length);
  Loading.hide();
};
</script>
<style lang="scss">
.my-sticky-header-table {
  /* height or max-height is important */
  height: 1200px;

  .q-table__top,
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: #98c23b;
  }

  .q-table__bottom {
    background-color: #cbe09d;
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }

  thead tr:first-child th {
    top: 0;
  }

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }

  /* prevent scrolling behind sticky top row on focus */
  tbody {
    /* height of all previous header rows */
    scroll-margin-top: 48px;
  }
}
</style>
./FileRead/models
