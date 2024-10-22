<template>
  <div class="exam-schedule q-pa-md">
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card class="my-card">
          <q-card-section>
            <div class="text-h6">Date Selection</div>
            <q-date
            v-model="state.date"
            first-day-of-week="1"
            mask="YYYY-MM-DD"
            :events="highlightDays"
            :event-color="colorPick"
            :options="disablePastDates"
            today-btn
            no-unset
          />
          </q-card-section>
          <q-card-section>
            <div class="row items-center q-gutter-sm">
              <q-toggle v-model="state.invigilators" label="Invigilators" color="orange" />
              <q-toggle v-model="state.examiners" label="Examiners" color="blue" />
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="primary" label="Add Date" @click="addDate" icon="add" flat />
            <q-btn color="secondary" label="Inform Users" @click="openInformDialog" icon="send" flat />
          </q-card-actions>
        </q-card>
      </div>

      <div class="col-12 col-md-8">
        <q-card class="my-card">
          <q-card-section>
            <div class="text-h6">Exam Days</div>
            <q-input v-model="search" placeholder="Search exam days" dense outlined class="q-mt-sm">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </q-card-section>
          <q-card-section>
            <q-table
              :rows="filteredExamDays"
              :columns="columns"
              row-key="date"
              :pagination="{ rowsPerPage: 0 }"
              flat
              bordered
              :filter="search"
              class="primary-header"
            >
              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="date" :props="props">
                    {{ formatDate(props.row.date) }}
                  </q-td>
                  <q-td key="type" :props="props">
                    <q-chip
                      v-if="props.row.isForInvigilators"
                      dense
                      square
                      color="orange"
                      text-color="white"
                      icon="person"
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
                      class="q-ml-xs"
                    >
                      E
                    </q-chip>
                  </q-td>
                  <q-td key="actions" :props="props">
                    <q-btn-group spread flat>
                      <q-btn
                        :icon="props.row.isLocked ? 'lock' : 'lock_open'"
                        :color="props.row.isLocked ? 'grey' : 'orange'"
                        @click="changeLock(props.row.id)"
                        flat
                        round
                      >
                        <q-tooltip>
                          {{ props.row.isLocked ? 'Unlock' : 'Lock' }} this date
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        @click="deleteExamDay(props.row.id)"
                        icon="delete"
                        color="red"
                        flat
                        round
                      >
                        <q-tooltip>Delete this exam day</q-tooltip>
                      </q-btn>
                    </q-btn-group>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="state.showInformDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Inform Users - Please check all dates!</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-form @submit="submitInformUsers" class="q-gutter-md">
            <q-input
              v-model="informUsersForm.startDate"
              label="Start Date"
              type="date"
              :rules="[val => !!val || 'Start Date is required']"
              outlined
            />
            <q-input
              v-model="informUsersForm.endDate"
              label="End Date"
              type="date"
              :rules="[val => !!val || 'End Date is required']"
              outlined
            />
            <q-input
              v-model="informUsersForm.dateOfSubmission"
              label="Date of Submission"
              type="date"
              :rules="[val => !!val || 'Date of Submission is required']"
              outlined
            />
        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" color="negative" @click="state.showInformDialog = false" />
          <q-btn flat label="Send" color="primary" type="submit" :loading="state.loadingSend" :disable="state.loadingSend" />
        </q-card-actions>
        </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useExamDayStore } from '../../stores/examDayStore';
import { DayOfExams } from 'src/db/types';
import { useQuasar } from 'quasar';

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
  const sortedDays = [...examDays.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (!search.value) return sortedDays;

  const searchLower = search.value.toLowerCase();
  return sortedDays.filter(day =>
    formatDate(day.date).toLowerCase().includes(searchLower) ||
    (day.isForInvigilators && 'invigilator'.includes(searchLower)) ||
    (day.isForExaminers && 'examiner'.includes(searchLower))
  );
});


const addDate = async () => {
  const sDate = new Date(state.date);
  await examDayStore.addExamDay(sDate, state.invigilators, state.examiners);
  await refreshExamDays();
};

const openInformDialog = () => {
  const nonLockedDays = examDays.value.filter(day => !day.isLocked);
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

  state.loadingSend = true; // Start loading
  try {
    await examDayStore.informUsers(informUsersForm.startDate, informUsersForm.endDate, informUsersForm.dateOfSubmission);
  } catch (error) {
    console.error(error);
  } finally {
    state.loadingSend = false; // Stop loading
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
      label: 'Inform',
      color: 'positive',
    },
    cancel: {
      label: 'Go back',
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
    return examDate.toISOString().split('T')[0] === formattedDate;
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
    return examDate.toISOString().split('T')[0] === formattedDate;
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
  await examDayStore.loadExamDays();
  examDays.value = examDayStore.upcomingExamDays;
};

onMounted(async () => {
  await refreshExamDays();
});

</script>

<style scoped>
.exam-schedule {
  max-width: 1200px;
  margin: 0 auto;
}

.my-card {
  width: 100%;
  transition: all 0.3s ease;
}

.my-card:hover {
  box-shadow: 0 8px 12px rgba(0,0,0,0.1);
}
</style>
