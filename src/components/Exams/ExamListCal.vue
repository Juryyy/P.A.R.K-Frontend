<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-lg">
      <!-- Calendar Column -->
      <div class="col-12 col-md-4">
        <q-card class="calendar-card">
          <q-card-section>
            <div class="text-h5 q-mb-md">Exam Calendar</div>
            <q-date
              v-model="state.selectedDate"
              first-day-of-week="1"
              mask="YYYY-MM-DD"
              :events="highlightDays"
              :event-color="colorPick"
              today-btn
              no-unset
              class="full-width"
            />
          </q-card-section>
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Legend:</div>
            <div class="row q-gutter-md items-center">
              <q-chip color="red" size="large" label="Missing Exams" />
              <q-chip color="orange" size="large" label="Exams Scheduled" />
              <q-chip color="blue" size="large" label="All Exams Prepared" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Exams List Column -->
      <div class="col-12 col-md-8">
        <q-card v-if="state.selectedDate" class="exam-list-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-lg">
              <div class="text-h5">Exams for {{ formatDate(state.selectedDate) }}</div>
              <q-btn
                color="primary"
                label="Create New Exam"
                @click="state.showAddExam = true"
                size="medium"
                :disable="!state.isExamDayAvailable"
              >
              <q-tooltip v-if="!state.isExamDayAvailable">
                There is not availability for this date. Please select a date with an existing availability to create a new exam.
              </q-tooltip>
            </q-btn>
            </div>
            <div v-if="filteredExams.length === 0" class="text-h6 text-center q-pa-xl">
              No exams scheduled for this date.
            </div>
            <q-list separator>
              <q-item v-for="exam in filteredExams" :key="exam.id" :class="cardClass(exam)" class="q-py-md">
                <q-item-section>
                  <!-- Clickable content -->
                  <div @click="editExam(exam.id)" class="cursor-pointer">
                    <q-item-label class="text-h6">{{ exam.type }}</q-item-label>
                    <q-item-label class="text-subtitle1 q-mt-sm">{{ exam.location }} - {{ exam.venue }}</q-item-label>
                    <q-item-label class="text-body q-mt-sm">Levels: {{ exam.levels.join(', ') }}</q-item-label>
                    <q-item-label class="text-body q-mt-sm">Time: {{ formatTimeString(exam.startTime) }} - {{ formatTimeString(exam.endTime) }}</q-item-label>
                  </div>

                  <!-- Note section -->
                  <q-item-label class="text-body q-mt-xs">
                    Note:
                    <span
                      v-if="shouldShowMoreLink(exam.note)"
                      @click.stop="showFullNoteDialog(exam.note)"
                      class="cursor-pointer text-primary note-link"
                    >
                      {{ truncatedNote(exam.note) }}...more
                    </span>
                    <span v-else>{{ exam.note }}</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
        <div v-else class="text-h5 text-center q-pa-xl">Select a date to view exams</div>
      </div>
    </div>

    <!-- Add New Exam Dialog -->
    <q-dialog v-model="state.showAddExam" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add New Exam</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="resetInputExam" />
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <q-form @submit="addExam" class="q-gutter-md" ref="examForm">
            <div class="row q-col-gutter-xs">
              <div class="col-12 col-md-6">
                <q-select
                  dense
                  filled
                  v-model="inputExam.location"
                  label="Location"
                  :options="examLocations"
                  @update:model-value="updateExamVenues"
                  :rules="[val => !!val || 'Location is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  dense
                  filled
                  v-model="inputExam.venue"
                  label="Venue"
                  :options="examVenues"
                  :rules="[val => !!val || 'Venue is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  dense
                  filled
                  v-model="inputExam.type"
                  label="Exam Type"
                  :options="examTypes"
                  :rules="[val => !!val || 'Exam type is required']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  dense
                  filled
                  v-model="inputExam.levels"
                  label="Levels"
                  :options="levelOptions"
                  multiple
                  use-chips
                  :rules="[val => val.length > 0 || 'At least one level must be selected']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  dense
                  filled
                  v-model="inputExam.startTime"
                  label="Start Time"
                  type="time"
                  :rules="[
                    val => !!val || 'Start time is required',
                    val => !inputExam.endTime || val < inputExam.endTime || 'Start time must be before end time'
                  ]"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  dense
                  filled
                  v-model="inputExam.endTime"
                  label="End Time"
                  type="time"
                  :rules="[
                    val => !!val || 'End time is required',
                    val => !inputExam.startTime || val > inputExam.startTime || 'End time must be after start time'
                  ]"
                />
              </div>
              <div class="col-12">
                <q-input
                  dense
                  filled
                  v-model="inputExam.note"
                  label="Note"
                  type="text"
                  rows="3"
                />
              </div>
            </div>
            <div class="row justify-end q-gutter-sm q-mt-md">
              <q-btn label="Cancel" color="grey" flat @click="resetInputExam" />
              <q-btn label="Add Exam" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Full Note Dialog -->
    <q-dialog v-model="showNoteDialog">
      <q-card style="min-width: 350px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h5">Full Note</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <p class="text-body1">{{ fullNote }}</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="primary" v-close-popup size="large" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch} from 'vue';
import { useExamDayStore } from 'src/stores/examDayStore';
import { useExamStore } from 'src/stores/examStore';
import { useAdminStore } from 'src/stores/adminStore';
import { Loading, Notify, QForm } from 'quasar';
import { DayOfExams, Exam, LevelEnum, ExamTypeEnum, Location, Venue } from 'src/db/types';
import { router } from 'src/router/index';
import { formatTimeString } from 'src/helpers/FormatTime';
import { nextTick } from 'vue';

const examDayStore = useExamDayStore();
const examStore = useExamStore();
const adminStore = useAdminStore();

const examDays: DayOfExams[] = examDayStore.upcomingExamDays;
const exams: Exam[] = examStore.upcomingExams;

const levelOptions = Object.values(LevelEnum);
const examTypes = Object.values(ExamTypeEnum);

const inputExam = reactive({
  location: '',
  venue: '',
  type: '',
  levels: [],
  startTime: '',
  endTime: '',
  note: '',
});

const showNoteDialog = ref(false);
const fullNote = ref('');

const examsRef = ref(exams);
const currentDate = new Date();

const examVenues = ref(['']);
const examLocations = ref(['']);

const examForm = ref<QForm | null>(null);

examLocations.value = adminStore.locationsWithVenues.map((location: Location) => location.name);
const updateExamVenues = () => {
  inputExam.venue = '';
  const selectedLoc: Location | undefined = adminStore.locationsWithVenues.find(
    (location: Location) => location.name === inputExam.location
  );

  if (selectedLoc) {
    examVenues.value = selectedLoc.venues.map((venue: Venue) => venue.name);
  }
};

const resetInputExam = () => {
  inputExam.location = '';
  inputExam.venue = '';
  inputExam.type = '';
  inputExam.levels = [];
  inputExam.startTime = '';
  inputExam.endTime = '';
  inputExam.note = '';
  state.showAddExam = false;
};

const state = reactive({
  show: false,
  selectedExamDay: undefined as DayOfExams | undefined,
  selectedDate: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
  years: false,
  showAddExam: false,
  isExamDayAvailable: false,
});


const checkExamDayAvailability = (date: string) => {
  if (!date) return false;

  const selectedDate = new Date(date);
  const isAvailable = examDays.some(examDay => {
    const examDayDate = new Date(examDay.date);
    const result =
      selectedDate.getDate() === examDayDate.getDate() &&
      selectedDate.getMonth() === examDayDate.getMonth() &&
      selectedDate.getFullYear() === examDayDate.getFullYear();
    return result;
  });

  return isAvailable;
};

watch(() => state.selectedDate, (newDate) => {
  state.isExamDayAvailable = checkExamDayAvailability(newDate);
}, { immediate: true });


const addExam = async () => {
  const selectedDate = state.selectedDate;

  if (!state.isExamDayAvailable) {
    Notify.create({
      message: 'No exam day available for the selected date',
      color: 'red',
      icon: 'error'
    });
    return;
  }

  if (examForm.value) {
    const isValid = await examForm.value.validate();
    if (!isValid) {
      Notify.create({
        message: 'Please fill all required fields correctly',
        color: 'red',
        icon: 'error'
      });
      return;
    }
  }

  if (selectedDate) {
    const qDate = new Date(selectedDate);

    const matchingExamDay = examDays.find((examDay) => {
      const examDayDate = new Date(examDay.date);
      return (
        qDate.getDate() === examDayDate.getDate() &&
        qDate.getMonth() === examDayDate.getMonth() &&
        qDate.getFullYear() === examDayDate.getFullYear()
      );
    });

    if (matchingExamDay && matchingExamDay.id !== undefined) {
      Loading.show({
        message: 'Adding exam...',
        spinnerColor: 'amber',
        messageColor: 'amber',
        backgroundColor: 'black',
      });
      await examStore.createExam({
        ...inputExam,
        dayOfExamsId: matchingExamDay.id,
      });
      await examStore.loadUpcomingExams();
      examsRef.value = examStore.upcomingExams;
      state.showAddExam = false;
      Loading.hide();
    } else {
      Notify.create({
        message: 'No exam day found for selected date',
        color: 'red',
        icon: 'report_problem',
      });
    }
  } else {
    Notify.create({
      message: 'No date selected',
      color: 'red',
      icon: 'report_problem',
    });
  }
};

const editExam = async (examId: number) => {
  await nextTick();
  router.push(`/admin/exams/${examId}`);
};

const highlightDays = (date: string) => {
  const normalizedDate = date.replace(/\//g, '-'); // Normalize the date format
  return examDays.some((examDay) => {
    const [year, month, day] = normalizedDate.split('-').map(Number);
    const qDate = new Date(Date.UTC(year, month - 1, day));
    const examStartDate = new Date(Date.UTC(
      new Date(examDay.date).getUTCFullYear(),
      new Date(examDay.date).getUTCMonth(),
      new Date(examDay.date).getUTCDate()
    ));
    return (
      qDate.toISOString().split('T')[0] === examStartDate.toISOString().split('T')[0]
    );
  });
};

const colorPick = (date: string) => {
  const normalizedDate = date.replace(/\//g, '-'); // Normalize the date format
  const [year, month, day] = normalizedDate.split('-').map(Number);
  const formattedDate = new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];


  // Check if any exams exist on the highlighted date
  const examsForDate = examsRef.value.filter((exam) => {
    const examStartDate = new Date(exam.startTime).toISOString().split('T')[0];
    return examStartDate === formattedDate;
  });

  const examExists = examsForDate.length > 0;

  // Check if all exams for the date are completed
  const allExamsCompleted = examExists && examsForDate.every((exam) => exam.isPrepared);

  const isHighlighted = highlightDays(formattedDate);

  if (isHighlighted) {
    if (allExamsCompleted) {
      return 'blue';
    } else {
      return examExists ? 'orange' : 'red';
    }
  }

  return 'green';
};


const filteredExams = computed(() => {
  if (state.selectedDate) {
    return examsRef.value.filter((exam) => {
      const examStartDate = new Date(exam.startTime).toISOString().split('T')[0];
      return examStartDate === state.selectedDate;
    });
  } else {
    return [];
  }
});


const truncatedNote = (note: string | undefined) => {
  const maxLength = 25;
  if (note && note.length > maxLength) {
    return `${note.substring(0, maxLength)}`;
  }
  return note;
};

const shouldShowMoreLink = (note: string | undefined) => {
  const maxLength = 50;
  return note && note.length > maxLength;
};

const showFullNoteDialog = (note: string) => {
  fullNote.value = note;
  showNoteDialog.value = true;
};

const cardClass = (exam: Exam) => {
  if (exam.isPrepared && !exam.isCompleted) {
    return 'positive-border top-card q-ma-md';
  } else if (exam.isCompleted) {
    return 'complete-border top-card q-ma-md';
  } else {
    return 'top-card q-ma-md';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const year = date.getFullYear();
  const month = months[date.getMonth()];
  const day = date.getDate();

  return `${month} ${day}, ${year}`;
};

</script>

<style lang="scss" scoped>
.calendar-card, .exam-list-card {
  height: 100%;
}

.exam-list-card {
  .q-item {
    border-left: 6px solid transparent;
    transition: all 0.3s ease;

    &:hover {
      background-color: #f0f0f0;
    }
  }
}

.positive-border {
  border-left-color: #21BA45 !important;
}

.complete-border {
  border-left-color: #FFD700 !important;
}

// Global style to increase base font size
.q-dialog__inner > div {
  border-radius: 8px;
}

.q-card {
  max-height: 90vh;
  overflow-y: auto;
  max-width: 90vw;
}


// Adjust input styles for better consistency
:deep(.q-field) {
  margin-bottom: 12px;
}

:deep(.q-field__control) {
  height: 40px;
}

:deep(.q-field__native),
:deep(.q-field__prefix),
:deep(.q-field__suffix),
:deep(.q-field__input) {
  padding: 8px;
  font-size: 14px !important;
}

// Adjust chip size in multi-select
:deep(.q-chip) {
  font-size: 12px;
  height: 24px;
}
</style>
