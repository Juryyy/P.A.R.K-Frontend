<template>
  <div class="exam-schedule q-pa-md">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-lg-4">
        <q-card class="my-card">
          <q-card-section>
            <div class="text-h5 text-weight-bold q-mb-md text-primary">Availability Date Selection - {{ props.centre }}</div>
            <q-date
              v-model="state.date"
              first-day-of-week="1"
              mask="YYYY-MM-DD"
              :events="highlightDays"
              :event-color="colorPick"
              :options="disablePastDates"
              today-btn
              no-unset
              class="full-width"
              style="max-height: 350px"
            />
          </q-card-section>

          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-sm justify-between items-center">
              <div class="col-6">
                <q-toggle
                  v-model="state.invigilators"
                  label="Invigilators"
                  color="orange"
                  dense
                />
              </div>
              <div class="col-6">
                <q-toggle
                  v-model="state.examiners"
                  label="Examiners"
                  color="blue"
                  dense
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn color="primary" label="Add Date" @click="addDate" icon="add" flat />
            <q-btn color="secondary" label="Inform Users" @click="openInformDialog" icon="send" flat />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-lg-8">
        <q-card class="my-card">
          <q-card-section>
            <div class="text-h5 text-weight-bold q-mb-md text-primary">Exam Days - {{ props.centre }}</div>
            <q-input
              v-model="search"
              placeholder="Search exam days"
              dense
              outlined
              class="q-mb-md"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>

          <q-card-section class="q-px-md">
            <q-table
              :rows="filteredExamDays"
              :columns="columns"
              row-key="date"
              :pagination="{ rowsPerPage: 10 }"
              flat
              bordered
              :filter="search"
              class="primary-header"
              :table-style="{ minWidth: '500px' }"
              wrap-cells
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="date" :props="props" auto-width>
                    {{ formatDate(props.row.date) }}
                  </q-td>
                  <q-td key="type" :props="props" class="text-center">
                    <div class="row items-center justify-center q-gutter-x-xs">
                      <q-chip
                        v-if="props.row.isForInvigilators"
                        dense
                        square
                        color="orange"
                        text-color="white"
                        icon="person"
                        size="sm"
                      >
                        I
                      </q-chip>
                      <q-chip
                        v-if="props.row.isForExaminers"
                        dense
                        square
                        color="blue"
                        text-color="white"
                        icon="school"
                        size="sm"
                      >
                        E
                      </q-chip>
                    </div>
                  </q-td>
                  <q-td key="actions" :props="props" class="text-center">
                    <div class="row items-center justify-center q-gutter-x-sm">
                      <q-btn
                        :icon="props.row.isLocked ? 'lock' : 'lock_open'"
                        :color="props.row.isLocked ? 'grey' : 'orange'"
                        @click="changeLock(props.row.id)"
                        flat
                        round
                        dense
                      />
                      <q-btn
                        @click="deleteExamDay(props.row.id)"
                        icon="delete"
                        color="red"
                        flat
                        round
                        dense
                      />
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>


    <q-dialog v-model="state.showInformDialog" persistent>
      <q-card style="min-width: 300px; max-width: 400px">
        <q-card-section class="q-pb-none">
          <div class="text-h6">Inform Users - Please check all dates!</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit="submitInformUsers" class="q-gutter-md">
            <q-input
              v-model="informUsersForm.startDate"
              label="Start Date"
              type="date"
              :rules="[val => !!val || 'Start Date is required']"
              outlined
              dense
            />
            <q-input
              v-model="informUsersForm.endDate"
              label="End Date"
              type="date"
              :rules="[val => !!val || 'End Date is required']"
              outlined
              dense
            />
            <q-input
              v-model="informUsersForm.dateOfSubmission"
              label="Date of Submission"
              type="date"
              :rules="[val => !!val || 'Date of Submission is required']"
              outlined
              dense
            />
            <div class="row justify-end q-gutter-sm">
              <q-btn flat label="Cancel" color="negative" @click="state.showInformDialog = false" />
              <q-btn flat label="Send" color="primary" type="submit" :loading="state.loadingSend" :disable="state.loadingSend" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useExamDayStore } from '../../stores/examDayStore';
import { DayOfExams, CentreEnum } from 'src/db/types';
import { useQuasar } from 'quasar';

const props = defineProps<{
  centre: CentreEnum;
}>();

const $q = useQuasar();
const examDayStore = useExamDayStore();
const examDays = ref<DayOfExams[]>(examDayStore.upcomingExamDays);
const search = ref('');
const currentDate = new Date();

const state = reactive({
  date: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
  invigilators: true,
  examiners: true,
  showInformDialog: false,
  loadingSend: false,
});

const informUsersForm = reactive({
  startDate: '',
  endDate: '',
  dateOfSubmission: '',
});

const columns : any = [
  { name: 'date', label: 'Date', field: 'date', sortable: true, align: 'left' },
  { name: 'type', label: 'Type', field: 'type', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
];

const filteredExamDays = computed(() => {
  const centreFilteredAndSorted = [...examDays.value]
    .filter(day => day.adminCentre === props.centre)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!search.value) return centreFilteredAndSorted;

  const searchLower = search.value.toLowerCase();
  return centreFilteredAndSorted.filter(day =>
    formatDate(day.date).toLowerCase().includes(searchLower) ||
    (day.isForInvigilators && 'invigilator'.includes(searchLower)) ||
    (day.isForExaminers && 'examiner'.includes(searchLower))
  );
});


const addDate = async () => {
  const sDate = new Date(state.date);
  await examDayStore.addExamDay(sDate, state.invigilators, state.examiners, props.centre);
  await refreshExamDays();
};

const openInformDialog = () => {
  const nonLockedDays = examDays.value
    .filter(day => !day.isLocked && day.adminCentre === props.centre);

  if (nonLockedDays.length > 0) {
    informUsersForm.startDate = formatDateForInput(nonLockedDays[0].date);
    informUsersForm.endDate = formatDateForInput(nonLockedDays[nonLockedDays.length - 1].date);
  }
  state.showInformDialog = true;
};

const formatDateForInput = (date: Date | string) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const submitInformUsers = async () => {
  if (!informUsersForm.startDate || !informUsersForm.endDate || !informUsersForm.dateOfSubmission) {
    $q.notify({
      message: 'All fields are required!',
      color: 'negative',
    });
    return;
  }

  state.loadingSend = true;
  try {
    await examDayStore.informUsers(informUsersForm.startDate, informUsersForm.endDate, informUsersForm.dateOfSubmission, props.centre);
  } catch (error) {
    console.error(error);
  } finally {
    state.loadingSend = false;
    state.showInformDialog = false;
  }
};


const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

};

const deleteExamDay = async (id: number) => {
  $q.dialog({
    title: 'Confirm Deletion',
    message: 'Are you sure you want to delete this exam day?',
    ok: {
      label: 'Remove date',
      color: 'positive',
    },
    cancel: {
      label: 'Cancel',
      color: 'negative',
    },
    persistent: true
  }).onOk(async () => {
    $q.loading.show();
    await examDayStore.deleteExamDay(id);
    await refreshExamDays();
    $q.loading.hide();
  });
};

const highlightDays = (date: string) => {
  const [year, month, day] = date.split('/');
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const result = examDays.value.some(examDay => {
    const examDate = new Date(examDay.date);
    return examDate.toISOString().split('T')[0] === formattedDate &&
           examDay.adminCentre === props.centre;
  });
  return result;
};

const disablePastDates = (date: string) => {
  const [year, month, day] = date.split('/');
  const selectedDate = new Date(`${year}-${month}-${day}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return selectedDate >= today;
};

const colorPick = (date: string) => {
  const [year, month, day] = date.split('/');
  const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const examDay = examDays.value.find((day) => {
    const examDate = new Date(day.date);
    return examDate.toISOString().split('T')[0] === formattedDate && day.adminCentre === props.centre;;
  });


  if (examDay) {
    if (examDay.isForInvigilators && examDay.isForExaminers) {
      return 'purple';
    } else if (examDay.isForInvigilators) {
      return 'orange';
    } else if (examDay.isForExaminers) {
      return 'blue';
    }
  }

  return 'white';
};


const changeLock = async (id: number) => {
  const examDay = examDays.value.find(day => day.id === id);
  if (examDay) {
    await examDayStore.changeLock(id);
    await refreshExamDays();
  }
};

const refreshExamDays = async () => {
  await examDayStore.loadExamDays(props.centre);
  examDays.value = examDayStore.upcomingExamDays;
};

onMounted(async () => {
  await refreshExamDays();
});

</script>

<style scoped>
.exam-schedule {
  margin: 0 auto;
  max-width: 1400px; /* Added max-width for better large screen display */
}

.my-card {
  width: 100%;
  transition: all 0.3s ease;
  height: 100%; /* Made cards equal height */
}

.my-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

/* Added responsive adjustments */
@media (max-width: 599px) {
  .q-table {
    font-size: 12px;
  }

  .q-btn {
    padding: 4px 8px;
  }

  .q-chip {
    height: 24px;
  }
}

/* Ensure table doesn't overflow on mobile */
.q-table__container {
  overflow-x: auto;
}
</style>
