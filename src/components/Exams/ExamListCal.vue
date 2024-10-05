<template>
  <q-page class="full-width">
    <div class="calendar-container q-mt-md">
      <q-date
        class="vertical-top"
        first-day-of-week="1"
        v-model="state.selectedDate"
        no-unset
        mask="YYYY-MM-DD"
        :events="highlightDays"
        :event-color="colorPick"
        today-btn
      >
      </q-date>
    </div>

    <q-intersection class="q-ma-md primaried" v-if="state.selectedDate">
      <div class="cards-container q-mt-md q-flex q-flex-wrap q-justify-around">
        <q-card
          bordered
          :class="cardClass(exam)"
          v-for="exam in filteredExams"
          :key="exam.id"
        >
          <q-card-section>
            <div class="text-h5">{{ exam.type }}</div>
            <div class="text-h6">Location: {{ exam.location + ' - ' + exam.venue }}</div>
            <div>Levels: {{ exam.levels.join(', ') }}</div>
            <div>Start time: {{ formatTimeString(exam.startTime) }}</div>
            <div>End time: {{ formatTimeString(exam.endTime) }}</div>
            <div>
              Note:
              <span
                v-if="shouldShowMoreLink(exam.note)"
                @click="showFullNoteDialog()"
              >
                {{ truncatedNote(exam.note) }}
                <span class="more-link">...more</span>
              </span>
              <span v-else>
                {{ exam.note }}
              </span>
            </div>
            <q-separator />
            <div>
              Supervisors:
              <div v-if="exam.supervisors.length === 0">
                No supervisors assigned
              </div>

              <div
                v-else
                v-for="supervisor in exam.supervisors"
                :key="supervisor.id"
              >
                <b>{{ supervisor.firstName }} {{ supervisor.lastName }}</b>
              </div>
            </div>

            <div>
              Invigilators:
              <div v-if="exam.invigilators.length === 0">
                No invigilators assigned
              </div>

              <div
                v-else
                v-for="invigilator in exam.invigilators"
                :key="invigilator.id"
              >
                <b>{{ invigilator.firstName }} {{ invigilator.lastName }}</b>
              </div>
            </div>

            <div>
              Examiners:
              <div v-if="exam.examiners.length === 0">
                No examiners assigned
              </div>
              <div v-else v-for="examiner in exam.examiners" :key="examiner.id">
                <b>{{ examiner.firstName }} {{ examiner.lastName }}</b>
              </div>
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn
              color="primary"
              label="Edit Exam"
              @click="editExam(exam.id)"
            />
            <q-dialog v-model="showNoteDialog">
              <q-card class="note-dialog-card">
                <q-card-section>
                  <div class="text-h6">Full Note</div>
                  <div class="note-content">{{ exam?.note }}</div>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn
                    color="primary"
                    label="Close"
                    @click="showNoteDialog = false"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
          </q-card-actions>
        </q-card>

        <div class="q-ma-md allign-bottom">
          <q-btn
            color="primary"
            label="Create new Exam"
            @click="state.showAddExam = true"
          />
        </div>

        <q-dialog persistent v-model="state.showAddExam">
          <q-card>
            <q-card-section>
              <div class="text-h6">Add new Exam</div>
              <q-form>
                <q-select
                  v-model="inputExam.location"
                  label="Location"
                  :options="examLocations"
                  transition-show="scale"
                  transition-hide="scale"
                  @update:model-value="updateExamVenues"
                />
                <q-select
                  v-model="inputExam.type"
                  label="Type"
                  :options="examTypes"
                  transition-show="scale"
                  transition-hide="scale"
                />
                <q-select
                  v-model="inputExam.venue"
                  label="Venue"
                  :options="examVenues"
                  transition-show="scale"
                  transition-hide="scale"
                />
                <q-select
                  v-model="inputExam.levels"
                  label="Levels"
                  :options="levelOptions"
                  transition-show="scale"
                  transition-hide="scale"
                  multiple
                  counter
                  use-chips
                />

                <q-input v-model="inputExam.startTime"
                label="Start time"
                type="time"
                />

                <q-input v-model="inputExam.endTime"
                label="End time"
                type="time"
                />
                <q-input v-model="inputExam.note" label="Note" type="textarea" />
              </q-form>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                color="red"
                label="Close"
                @click="resetInputExam()"
              />
              <q-btn color="primary" label="Add" @click="addExam" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
    </q-intersection>

    <div v-else class="text-h4 flex-center">Choose date</div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useExamDayStore } from 'src/stores/examDayStore';
import { useExamStore } from 'src/stores/examStore';
import { useAdminStore } from 'src/stores/adminStore';
import { Loading, Notify } from 'quasar';
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

const examsRef = ref(exams);
const currentDate = new Date();

const examVenues = ref(['']);
const examLocations = ref(['']);

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
});

const addExam = async () => {
  const selectedDate = state.selectedDate;

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

const getExamDayId = (examId: number) => {
  const exam = examsRef.value.find((exam) => exam.id === examId);
  if (exam && exam.dayOfExamsId) {
    return exam.dayOfExamsId;
  }
  return undefined;
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

// Function to open the dialog with the full note
const showFullNoteDialog = () => {
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

</script>

<style lang="scss" scoped>
.full-width {
  width: 100%;
}

.calendar-container {
  display: flex;
  justify-content: center;
}

.cards-container {
  display: flex;
}

.border {
  border: 1px solid black;
  border-radius: 10px;
}

.allign-bottom {
  align-self: flex-end;
}

.primaried {
  background-color: #f0f0f0;
  border-radius: 10px;
}

@media only screen and (max-width: 600px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
}

.positive-border {
  border: 3px solid #CBE09D;
}

.complete-border {
  border: 3px solid #FFD700;
}
</style>

