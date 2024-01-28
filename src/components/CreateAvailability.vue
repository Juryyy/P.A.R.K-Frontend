<template>
  <div class="table-container q-mb-md">
    <q-date v-model="state.date"
      first-day-of-week="1"
     mask="YYYY-MM-DD"
     :events="highlightDays"
     today-btn
     no-unset
      />
  </div>
  <div class="table-container">
  <q-toggle v-model="state.invigilators" label="Invigilators" />
  <q-toggle v-model="state.examiners" label="Examiners" />
  </div>
  <div class="table-container q-mb-md">
  <q-btn color="primary" label="Add Date" @click="addDate()" />
  </div>

  <div class="table-container">
    <q-table
    :rows="examDaysRef"
    :columns="columns"
    row-key="date"
    :hide-pagination="true"
    :rows-per-page-options="[0]"
    >
      <template v-slot:body-cell-date="props">
        <q-td :props="props">
          {{ formatDate(props.row.date) }}
        </q-td>
      </template>
      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <q-chip v-if="props.row.isForInvigilators" label="I" color="green" />
          <q-chip v-else label="I" color="grey" />
          <q-chip v-if="props.row.isForExaminers" label="E" color="green" />
          <q-chip v-else label="E" color="grey" />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn @click="editExamDay(props.row.id)" icon="edit" color="blue" />
          <q-btn @click="deleteExamDay(props.row.id)" icon="delete" color="red" />
        </q-td>
      </template>
    </q-table>
  </div>

</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useExamDayStore } from 'src/stores/examDayStore';
import { DayOfExams } from 'src/stores/db/types';

const examDayStore = useExamDayStore();

const examDays: DayOfExams[] = examDayStore.upcomingExamDays;
const currentDate = new Date()

const examDaysRef = ref(examDays.reverse())

const state = reactive({
  date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
  invigilators: true,
  examiners: false
})

const addDate = async () => {
  const sDate = new Date(state.date)
  await examDayStore.addExamDay(sDate, state.invigilators, state.examiners)
  await examDayStore.loadExamDays()
  examDaysRef.value = examDayStore.upcomingExamDays
}

const columns: any = [
  { name: 'date', label: 'Date', align: 'left', field: 'date', sortable: true },
  { name: 'type', label: 'Type', align: 'left', field: 'Type' },
  { name: 'actions', label: 'Actions', align: 'left', field: 'id' },
];

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2.$1.$3'); // DD.MM.YYYY
};

const editExamDay = (id : number) => {
  console.log('Edit exam day with ID:', id);
};

const deleteExamDay = async (id : number) => {
  await examDayStore.deleteExamDay(id)
  await examDayStore.loadExamDays()
  examDaysRef.value = examDayStore.upcomingExamDays
};

const highlightDays = (date: string) => {
  return examDaysRef.value.some((examDay) => {
    const [day, month, year] = date.split('-');
    const qDate = new Date(`${year}-${month}-${day}`);
    const examStartDate = new Date(examDay.date);

    return (
      qDate.getDate() === examStartDate.getDate() &&
      qDate.getMonth() === examStartDate.getMonth() &&
      qDate.getFullYear() === examStartDate.getFullYear()
    );
  });
};

</script>

<style scoped>
.table-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.table-container table {
  width: 100%;
}

.submit-btn {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
}
</style>
