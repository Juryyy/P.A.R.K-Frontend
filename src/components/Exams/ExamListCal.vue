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
          class="q-ma-md"
          v-for="exam in filteredExams"
          :key="exam.id"
        >
          <q-card-section>
            <div class="text-h6">Venue: {{ exam.venue }}</div>
            <div>Type: {{ exam.type }}</div>
            <div>Levels: {{ exam.levels.join(', ') }}</div>
            <div>Start time: {{ formatTime(exam.startTime) }}</div>
            <div>End time: {{ formatTime(exam.endTime) }}</div>
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
                {{ supervisor.firstName }} {{ supervisor.lastName }}
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
                {{ invigilator.firstName }} {{ invigilator.lastName }}
              </div>
            </div>

            <div>
              Examiners:
              <div v-for="examiner in exam.examiners" :key="examiner.id">
                {{ examiner.firstName }} {{ examiner.lastName }}
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
              <q-card>
                <q-card-section>
                  <div class="text-h6">Full Note</div>
                  <div>{{ exam?.note }}</div>
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

                <q-input v-model="inputExam.startTime" label="Start time">
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-time v-model="inputExam.startTime" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <q-input v-model="inputExam.endTime" label="End time">
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-time v-model="inputExam.endTime" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>

                <q-input v-model="inputExam.note" label="Note" />
              </q-form>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn
                color="red"
                label="Close"
                @click="state.showAddExam = false"
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
import { Loading, Notify } from 'quasar';
import { DayOfExams, Exam, LevelEnum, examTypeEnum } from 'src/stores/db/types';

const examDayStore = useExamDayStore();
const examStore = useExamStore();

const examDays: DayOfExams[] = examDayStore.upcomingExamDays;
const exams: Exam[] = examStore.upcomingExams;

const levelOptions = Object.values(LevelEnum);
const examTypes = Object.values(examTypeEnum);

const inputExam = reactive({
  location: '',
  venue: '',
  type: '',
  levels: [],
  startTime: '',
  endTime: '',
  note: '',
});

const examsRef = ref(exams);
const currentDate = new Date();

//! TODO: Get venues and locations from DB
const examVenues = ref([''])
const examLocations = ref([''])

const state = reactive({
  show: false,
  selectedExamDay: undefined as DayOfExams | undefined,
  selectedDate: `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
  years: false,
  showAddExam: false,
});

const addExam = async () => {
  const selectedDate = state.selectedDate;

  if (selectedDate) {
    const [day, month, year] = selectedDate.split('.');
    const qDate = new Date(`${year}-${month}-${day}`);

    const matchingExamDay = examDays.find((examDay) => {
      const examDayDate = new Date(examDay.date);
      return (
        qDate.getDate() === examDayDate.getDate() &&
        qDate.getMonth() === examDayDate.getMonth() &&
        qDate.getFullYear() === examDayDate.getFullYear()
      );
    });

    if (matchingExamDay) {
      Loading.show({
        message: 'Adding exam...',
        spinnerColor: 'amber',
        messageColor: 'amber',
        backgroundColor: 'black',
      });
      console.log('Adding exam with input:', inputExam);
      console.log('Matching exam day:', matchingExamDay);
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
  const getExamDay = getExamDayId(examId);
  if (getExamDay) await examDayStore.loadResponsesForExamDay(getExamDay);
  console.log('Edit exam with id:', examId, 'and exam day id:', getExamDay);
};

const highlightDays = (date: string) => {
  return examDays.some((examDay) => {
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

// Use computed to track changes in examsRef
const filteredExams = computed(() => {
  if (state.selectedDate) {
    const [day, month, year] = state.selectedDate.split('.');
    const qDate = new Date(`${year}-${month}-${day}`);

    const response = examsRef.value.filter((exam) => {
      if (qDate instanceof Date) {
        const examStartDate = new Date(exam.startTime);

        // Compare day, month, and year
        const isSameDay = qDate.getDate() === examStartDate.getDate();
        const isSameMonth = qDate.getMonth() === examStartDate.getMonth();
        const isSameYear = qDate.getFullYear() === examStartDate.getFullYear();

        return isSameDay && isSameMonth && isSameYear;
      } else {
        return false;
      }
    });

    return response;
  } else {
    return [];
  }
});

const formatTime = (datetime: Date) => {
  const date = new Date(datetime);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

const showNoteDialog = ref(false);

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

const colorPick = (date: string) => {
  const qDate = new Date(date);

  // Check if an exam exists on the highlighted date
  const examExists = examsRef.value.some((exam) => {
    const examStartDate = new Date(exam.startTime);

    return (
      qDate.getDate() === examStartDate.getDate() &&
      qDate.getMonth() === examStartDate.getMonth() &&
      qDate.getFullYear() === examStartDate.getFullYear()
    );
  });

  if (highlightDays(date)) {
    return examExists ? 'blue' : 'red';
  }

  return 'white';
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
</style>
