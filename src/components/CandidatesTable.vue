<template>
  <div id="q-app">
    <div class="q-pa-sm q-gutter-sm">
      <q-table
        class="my-sticky-header-table"
        flat bordered
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
            <q-td key="FirstName" :props="props">
              {{ props.row.FirstName }}
              <q-popup-edit v-model="props.row.FirstName">
                <q-input
                  v-model="props.row.FirstName"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="LastName" :props="props">
              {{ props.row.LastName }}
              <q-popup-edit v-model="props.row.LastName">
                <q-input
                  v-model="props.row.LastName"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="BirthDate" :props="props">
              {{ props.row.BirthDate.toLocaleDateString() }}
              <q-popup-edit v-model="props.row.BirthDate">
                <q-input
                  v-model="props.row.BirthDate"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Email" :props="props">
              {{ props.row.Email }}
              <q-popup-edit v-model="props.row.Email">
                <q-input
                  v-model="props.row.Email"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Code" :props="props">
              {{ props.row.Code }}
              <q-popup-edit v-model="props.row.Code">
                <q-input
                  v-model="props.row.Code"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Phone" :props="props">
              {{ props.row.Phone }}
              <q-popup-edit v-model="props.row.Phone">
                <q-input
                  v-model="props.row.Phone"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Location" :props="props">
              {{ props.row.Location }}
              <q-popup-edit v-model="props.row.Location">
                <q-input
                  v-model="props.row.Location"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Level" :props="props">
              {{ props.row.Level }}
              <q-popup-edit v-model="props.row.Level">
                <q-input
                  v-model="props.row.Level"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="TypeOfExam" :props="props">
              {{ props.row.TypeOfExam }}
              <q-popup-edit v-model="props.row.TypeOfExam">
                <q-input
                  v-model="props.row.TypeOfExam"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Venue" :props="props">
              {{ props.row.Venue }}
              <q-popup-edit v-model="props.row.Venue">
                <q-input
                  v-model="props.row.Venue"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="DateOfExam" :props="props">
              {{ props.row.DateOfExam.toLocaleDateString() }}
              <q-popup-edit v-model="props.row.DateOfExam">
                <q-input
                  v-model="props.row.DateOfExam"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="CrfToSchool" :props="props">
              {{ props.row.CrfToSchool }}
              <q-popup-edit v-model="props.row.CrfToSchool">
                <q-input
                  v-model="props.row.CrfToSchool"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Requirements" :props="props">
              {{ props.row.Requirements }}
              <q-popup-edit v-model="props.row.Requirements">
                <q-input
                  v-model="props.row.Requirements"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Mock" :props="props">
              {{ props.row.Mock }}
              <q-popup-edit v-model="props.row.Mock">
                <q-input
                  v-model="props.row.Mock"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Paid" :props="props">
              {{ props.row.Paid }}
              <q-popup-edit v-model="props.row.Paid">
                <q-input
                  v-model="props.row.Paid"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Note" :props="props">
              {{ props.row.Note }}
              <q-popup-edit v-model="props.row.Note">
                <q-input
                  v-model="props.row.Note"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="Partner" :props="props">
              {{ props.row.Partner }}
              <q-popup-edit v-model="props.row.Partner">
                <q-input
                  v-model="props.row.Partner"
                  dense
                  autofocus
                  counter
                ></q-input>
              </q-popup-edit>
            </q-td>
            <q-td key="OrderId" :props="props">
              {{ props.row.OrderId }}
              <q-popup-edit v-model="props.row.OrderId">
                <q-input
                  v-model="props.row.OrderId"
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
      </q-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Candidate } from './models';
import { useCandidateStore } from 'src/stores/candidateStore';
import { Dialog } from 'quasar';

const candidateStore = useCandidateStore();

const data = candidateStore.candidates;

const columns = [
  //{ name: 'id', required: true, label: 'ID', align: 'left', field: 'id' },
  {
    name: 'FirstName',
    required: true,
    label: 'First Name',
    align: 'left',
    field: 'FirstName',
  },
  {
    name: 'LastName',
    required: true,
    label: 'Last Name',
    align: 'left',
    field: 'LastName',
  },
  {
    name: 'BirthDate',
    required: true,
    label: 'Birth Date',
    align: 'left',
    field: (row: Candidate) => row.BirthDate.toLocaleDateString(),
  },
  {
    name: 'Email',
    required: true,
    label: 'Email',
    align: 'left',
    field: 'Email',
  },
  { name: 'Code',
    required: true,
    label: 'Code',
    align: 'left',
    field: 'Code'
  },
  {
    name: 'Phone',
    required: true,
    label: 'Phone',
    align: 'left',
    field: 'Phone',
  },
  {
    name: 'Location',
    required: true,
    label: 'Location',
    align: 'left',
    field: 'Location',
  },
  {
    name: 'Level',
    required: true,
    label: 'Level',
    align: 'left',
    field: 'Level',
  },
  {
    name: 'TypeOfExam',
    required: true,
    label: 'Type Of Exam',
    align: 'left',
    field: 'TypeOfExam',
  },
  {
    name: 'DateOfExam',
    required: true,
    label: 'Date Of Exam',
    align: 'left',
    field: (row: Candidate) => row.DateOfExam.toLocaleDateString(),
  },
  {
    name: 'CrfToSchool',
    required: true,
    label: 'CRF To School',
    align: 'left',
    field: 'CrfToSchool',
  },
  {
    name: 'Requirements',
    required: true,
    label: 'Requirements',
    align: 'left',
    field: 'Requirements',
  },
  { name: 'Mock', required: true, label: 'Mock', align: 'left', field: 'Mock' },
  { name: 'Paid', required: true, label: 'Paid', align: 'left', field: 'Paid' },
  { name: 'Note', required: true, label: 'Note', align: 'left', field: 'Note' },
  {
    name: 'Partner',
    required: true,
    label: 'Partner',
    align: 'left',
    field: 'Partner',
  },
  {
    name: 'OrderId',
    required: true,
    label: 'Order ID',
    align: 'left',
    field: 'OrderId',
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

  .q-table__bottom{
    background-color: #CBE09D
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
