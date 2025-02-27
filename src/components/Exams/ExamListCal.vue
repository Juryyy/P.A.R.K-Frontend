<template>
  <q-page class="q-px-md">
    <div class="row q-col-gutter-lg">
      <!-- Left Column - Calendar -->
      <div class="col-12 col-md-4">
        <q-card class="calendar-card">
          <q-card-section class="q-pb-none">
            <div class="text-h5 text-weight-bold q-mb-md text-primary">Exam Date Selection</div>
            <q-date
              v-model="state.selectedDate"
              first-day-of-week="1"
              mask="YYYY-MM-DD"
              :events="highlightDays"
              :event-color="colorPick"
              today-btn
              no-unset
              class="full-width calendar-custom"
              style="max-height: 350px"
            />
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle1 text-weight-medium q-mb-sm">Status Indicators:</div>
            <div class="legend-container q-gutter-y-sm">
              <div class="legend-item">
                <q-chip color="red" size="md" class="legend-chip">
                  <q-icon name="warning" size="sm" class="q-mr-sm" />
                  Missing Exams
                </q-chip>
              </div>
              <div class="legend-item">
                <q-chip color="orange" size="md" class="legend-chip">
                  <q-icon name="event" size="sm" class="q-mr-sm" />
                  Exams Scheduled
                </q-chip>
              </div>
              <div class="legend-item">
                <q-chip color="blue" size="md" class="legend-chip">
                  <q-icon name="check_circle" size="sm" class="q-mr-sm" />
                  All Exams Prepared
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column - Exam List -->
      <div class="col-12 col-md-8">
        <q-card v-if="state.selectedDate" class="exam-list-card">
          <q-card-section>
            <div class="row items-center justify-between q-mb-lg">
              <div>
                <div class="text-h5 text-weight-bold text-primary">{{ formatDate(state.selectedDate) }} -  {{props.centre}}</div>
                <div class="text-caption text-grey-7">Selected date exams</div>
              </div>
              <q-btn
                color="primary"
                :label="$q.screen.lt.sm ? 'New' : 'Create New Exam'"
                @click="state.showAddExam = true"
                :icon="$q.screen.lt.sm ? 'add' : 'add_circle'"
                size="md"
                :disable="!state.isExamDayAvailable"
                class="q-px-md"
              >
                <q-tooltip v-if="!state.isExamDayAvailable">
                  There is no availability for this date. Please select a date with existing availability.
                </q-tooltip>
              </q-btn>
            </div>

            <!-- Search Bar -->
            <q-input
              v-model="search"
              placeholder="Search exam days..."
              dense
              outlined
              class="q-mb-md search-input"
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="clear" @click="search = ''" class="cursor-pointer" v-if="search" />
              </template>
            </q-input>

            <!-- Empty State -->
            <div v-if="filteredExams.length === 0" class="empty-state q-pa-xl text-center">
              <q-icon name="event_busy" size="4rem" color="grey-5" />
              <div class="text-h6 text-grey-7 q-mt-md">No exams scheduled for this date</div>
            </div>

            <!-- Exam Cards -->
            <div v-else class="exam-cards q-gutter-y-md q-mt-md">
              <q-card
                v-for="exam in filteredExams"
                :key="exam.id"
                :class="[cardClass(exam), 'exam-card']"
                flat
                bordered
              >
                <q-card-section @click="editExam(exam.id)" class="cursor-pointer">
                  <div class="row items-start justify-between">
                    <div class="col-grow">
                      <div class="text-h6 text-weight-bold">{{ exam.type }}</div>
                      <div class="text-subtitle1 q-mt-sm">
                        <q-icon name="location_on" size="sm" color="primary" />
                        {{ exam.location }} - {{ exam.venue }}
                      </div>

                      <!-- Levels -->
                      <div class="q-mt-sm">
                        <div class="row q-gutter-x-sm">
                          <q-chip
                            v-for="level in exam.levels"
                            :key="level"
                            size="sm"
                            :color="getLevelColor(level)"
                            text-color="black"
                          >
                            {{ level }}
                          </q-chip>
                        </div>
                      </div>
                    </div>

                    <!-- Time -->
                    <div class="text-right">
                      <div class="text-subtitle2 text-weight-medium">
                        <q-icon name="schedule" size="sm" color="primary" />
                        {{ formatTimeString(exam.startTime) }} - {{ formatTimeString(exam.endTime) }}
                      </div>
                    </div>
                  </div>

                  <!-- Note -->
                  <div v-if="exam.note" class="q-mt-sm text-grey-8">
                    <div class="text-caption">Note:</div>
                    <div class="text-body2">
                      <span
                        v-if="shouldShowMoreLink(exam.note)"
                        @click.stop="showFullNoteDialog(exam.note)"
                        class="cursor-pointer text-primary"
                      >
                        {{ truncatedNote(exam.note) }}...more
                      </span>
                      <span v-else>{{ exam.note }}</span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
        <div v-else class="text-h5 text-center text-grey-7 q-pa-xl">
          Select a date to view exams
        </div>
      </div>
    </div>

    <!-- Add New Exam Dialog -->
    <q-dialog v-model="state.showAddExam" persistent class="exam-dialog">
      <q-card class="exam-card">
        <q-card-section class="header-section">
          <div class="text-h6">Add New Exam - {{props.centre}}</div>
        </q-card-section>

        <q-card-section class="form-section">
          <q-form @submit="addExam" class="exam-form" ref="examForm">
            <div class="form-grid">
              <!-- Location & Venue Section -->
              <div class="form-group">
                <div class="input-wrapper">
                  <q-icon name="location_on" class="field-icon" color="primary" />
                  <q-select
                    dense
                    filled
                    v-model="inputExam.location"
                    label="Location"
                    :options="examLocations"
                    @update:model-value="updateExamVenues"
                    :rules="[val => !!val || 'Location is required']"
                    class="full-width"
                  />
                </div>
                <div class="input-wrapper">
                  <q-icon name="place" class="field-icon" color="primary" />
                  <q-select
                    dense
                    filled
                    v-model="inputExam.venue"
                    :label="!inputExam.location ? 'Select a location first' : 'Venue'"
                    :options="examVenues"
                    :rules="[val => !!val || 'Venue is required']"
                    class="full-width"
                    :disable="!inputExam.location"
                  />
                </div>
              </div>

              <!-- Type & Levels Section -->
              <div class="form-group">
                <div class="input-wrapper">
                  <q-icon name="school" class="field-icon" color="primary"/>
                  <q-select
                    dense
                    filled
                    v-model="inputExam.type"
                    label="Exam Type"
                    :options="examTypes"
                    :rules="[val => !!val || 'Exam type is required']"
                    class="full-width"
                  />
                </div>
                <div class="input-wrapper">
                  <q-icon name="groups" class="field-icon" color="primary" />
                  <q-select
                    dense
                    filled
                    v-model="inputExam.levels"
                    label="Levels"
                    :options="levelOptions"
                    multiple
                    use-chips
                    :rules="[val => val.length > 0 || 'At least one level must be selected']"
                    class="full-width"
                  >
                    <template v-slot:selected-item="scope">
                      <q-chip
                        dense
                        removable
                        @remove="scope.removeAtIndex(scope.index)"
                        :label="scope.opt"
                        class="level-chip"
                      />
                    </template>
                  </q-select>
                </div>
              </div>

              <!-- Time Section -->
              <div class="form-group">
                <div class="input-wrapper">
                  <q-icon name="schedule" class="field-icon" color="primary"/>
                  <q-input
                    dense
                    filled
                    v-model="inputExam.startTime"
                    label="Start Time"
                    type="time"
                    :rules="timeRules.startTime"
                    class="full-width"
                  />
                </div>
                <div class="input-wrapper">
                  <q-icon name="schedule" class="field-icon" color="primary"/>
                  <q-input
                    dense
                    filled
                    v-model="inputExam.endTime"
                    label="End Time"
                    type="time"
                    :rules="timeRules.endTime"
                    class="full-width"
                  />
                </div>
              </div>

              <!-- Notes Section -->
              <div class="form-group full-width">
                <div class="input-wrapper">
                  <q-icon name="notes" class="field-icon" color="primary" />
                  <q-input
                    dense
                    filled
                    v-model="inputExam.note"
                    label="Note"
                    type="textarea"
                    rows="3"
                    class="full-width"
                    autogrow
                  />
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="actions-section">
              <q-btn
                label="Cancel"
                color="grey"
                flat
                @click="resetInputExam"
                class="action-button"
              />
              <q-btn
                label="Add Exam"
                type="submit"
                color="primary"
                class="action-button"
              />
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
import { ref, reactive, computed, watch, onMounted} from 'vue';
import { Loading, QForm } from 'quasar';
import { DayOfExams, Exam, LevelEnum, ExamTypeEnum, Location, Venue, CentreEnum } from 'src/db/types';
import { router } from 'src/router/index';
import { formatTimeString } from 'src/helpers/FormatTime';
import { nextTick } from 'vue';
import { getLevelColor } from 'src/helpers/Color';
import { useExamDay } from 'src/composables/useExamDay';
import { useAdmin } from 'src/composables/useAdmin';
import { useExam } from 'src/composables/useExam';
import { NotificationService } from 'src/utils/services/notificationService';

const props = defineProps<{
  centre: CentreEnum;
}>();

const examDays: DayOfExams[] = useExamDay().upcomingExamDays.value;
const exams: Exam[] = useExam().upcomingExams;

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
const search = ref('');

const examsRef = ref(exams);
const currentDate = new Date();

const examVenues = ref(['']);
const examLocations = ref(['']);

const examForm = ref<QForm | null>(null);

examLocations.value = useAdmin().locationsWithVenues.value
  .filter((location: Location) => location.adminCentre.includes(props.centre))
  .map((location: Location) => location.name);

const updateExamVenues = () => {
  inputExam.venue = '';
  const selectedLoc: Location | undefined = useAdmin().locationsWithVenues.value.find(
    (location: Location) => location.name === inputExam.location
  );

  if (selectedLoc) {
    examVenues.value = selectedLoc.venues.map((venue: Venue) => venue.name);
  }
};

onMounted(async () => {
  await useExamDay().loadExamDays(props.centre);
  await useAdmin().getLocationsWithVenues();
  await useExam().loadUpcomingExams();
  examsRef.value = useExam().upcomingExams.filter((exam) => exam.adminCentre === props.centre);
});

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
    return (
      selectedDate.getDate() === examDayDate.getDate() &&
      selectedDate.getMonth() === examDayDate.getMonth() &&
      selectedDate.getFullYear() === examDayDate.getFullYear() &&
      examDay.adminCentre === props.centre
    );
  });

  return isAvailable;
};

watch(() => state.selectedDate, (newDate) => {
  state.isExamDayAvailable = checkExamDayAvailability(newDate);
}, { immediate: true });


const addExam = async () => {
  const selectedDate = state.selectedDate;

  if (!state.isExamDayAvailable) {
    NotificationService.error('No exam day found for selected date');
    return;
  }

  if (examForm.value) {
    const isValid = await examForm.value.validate();
    if (!isValid) {
      NotificationService.error('Please fill in all required fields');
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
        qDate.getFullYear() === examDayDate.getFullYear() &&
        examDay.adminCentre === props.centre
      );
    });

    if (matchingExamDay && matchingExamDay.id !== undefined) {
      await useExam().createExam({
        ...inputExam,
        dayOfExamsId: matchingExamDay.id,
        adminCentre: props.centre,
      });
      await useExam().loadUpcomingExams();
      examsRef.value = useExam().upcomingExams.filter((exam) => exam.adminCentre === props.centre);
      state.showAddExam = false;
    } else {
      NotificationService.error('No exam day found for selected date');
    }
  }
};

const editExam = async (examId: number) => {
  await nextTick();
  router.push(`/admin/exams/${examId}`);
};

const highlightDays = (date: string) => {
  const normalizedDate = date.replace(/\//g, '-');
  return examDays.some((examDay) => {
    const [year, month, day] = normalizedDate.split('-').map(Number);
    const qDate = new Date(Date.UTC(year, month - 1, day));
    const examStartDate = new Date(Date.UTC(
      new Date(examDay.date).getUTCFullYear(),
      new Date(examDay.date).getUTCMonth(),
      new Date(examDay.date).getUTCDate()
    ));
    return (
      qDate.toISOString().split('T')[0] === examStartDate.toISOString().split('T')[0] &&
      examDay.adminCentre === props.centre
    );
  });
};

const colorPick = (date: string) => {
  const normalizedDate = date.replace(/\//g, '-');
  const [year, month, day] = normalizedDate.split('-').map(Number);
  const formattedDate = new Date(Date.UTC(year, month - 1, day)).toISOString().split('T')[0];

  const examsForDate = examsRef.value.filter((exam) => {
    const examStartDate = new Date(exam.startTime).toISOString().split('T')[0];
    return examStartDate === formattedDate && exam.adminCentre === props.centre;
  });

  const examExists = examsForDate.length > 0;
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

const timeRules = computed(() => ({
  startTime: [
    (val: any) => !!val || 'Start time is required',
    (val: any) => !inputExam.endTime || val < inputExam.endTime || 'Start time must be before end time'
  ],
  endTime: [
    (val: any) => !!val || 'End time is required',
    (val: any) => !inputExam.startTime || val > inputExam.startTime || 'End time must be after start time'
  ]
}))

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
  font-size: 14px !important;
}

// Adjust chip size in multi-select
:deep(.q-chip) {
  font-size: 12px;
  height: 24px;
}

.exam-dialog {
  .exam-card {
    width: 700px;
    max-width: 90vw;
    max-height: 90vh;
    border-radius: 12px;
    overflow: hidden;
  }

  .header-section {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }

  .form-section {
    padding: 20px;
  }

  .form-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1fr;

    @media (min-width: 600px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 12px;

    &.full-width {
      grid-column: 1 / -1;
    }
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items:baseline;
    gap: 8px;

    .field-icon {
      color: rgba(0, 0, 0, 0.54);
      font-size: 20px;
    }

    :deep(.q-field) {
      flex:1;

      .q-field__control {
        height: 44px;
        border-radius: 8px;
      }

      .q-field__native,
      .q-field__prefix,
      .q-field__suffix {
        font-size: 14px;
      }
    }
  }

  .level-chip {
    height: 24px;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.05);

    &:hover {
      background: rgba(0, 0, 0, 0.08);
    }
  }

  .actions-section {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }

  .action-button {
    min-width: 100px;
  }

  // Transitions
  .q-field {
    transition: all 0.3s ease;

    &:hover {
      .q-field__control {
        background: rgba(0, 0, 0, 0.03);
      }
    }

    &--focused {
      .q-field__control {
        border-color: var(--q-primary);
      }
    }
  }
}

</style>
