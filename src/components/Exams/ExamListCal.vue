<template>
  <q-page class="full-width">

    <div class="calendar-container q-mt-md">
  <q-date class="vertical-top"
  v-model="state.selectedDate"
  mask="YYYY-MM-DD"
  :events="highlightDays"
  :event-color="'orange'"
  today-btn>
  </q-date>
  </div>

  <q-intersection class="q-ma-md border" v-if="state.selectedDate">
    <div class="cards-container q-mt-md q-flex q-flex-wrap q-justify-around">
  <q-card bordered class="q-ma-md" v-for="exam in filteredExams" :key="exam.id">
    <q-card-section>
      <div class="text-h6">Venue: {{ exam.venue }}</div>
      <div>Type: {{ exam.type }}</div>
      <div>Levels: {{ exam.levels.join(', ') }}</div>
      <div>Start time: {{ formatTime(exam.startTime) }}</div>
      <div>End time: {{ formatTime(exam.endTime) }}</div>
      <div>Note:
        <span v-if="shouldShowMoreLink(exam.note)" @click="showFullNoteDialog()">
          {{ truncatedNote(exam.note) }} <span class="more-link">...more</span>
        </span>
        <span v-else>
          {{ exam.note }}
        </span>
      </div>
      <q-separator/>
      <div>Supervisors:
        <div v-if="exam.supervisors.length === 0">
          No supervisors assigned
        </div>

        <div v-else v-for="supervisor in exam.supervisors" :key="supervisor.id">
        {{ supervisor.firstName }} {{ supervisor.lastName }}
        </div>
      </div>

      <div>Invigilators:
        <div v-if="exam.invigilators.length === 0">
          No invigilators assigned
        </div>

        <div v-else v-for="invigilator in exam.invigilators" :key="invigilator.id">
        {{ invigilator.firstName }} {{ invigilator.lastName }}
        </div>
      </div>

      <div>Examiners:
        <div v-for="examiner in exam.examiners" :key="examiner.id">
        {{ examiner.firstName }} {{ examiner.lastName }}
        </div>
      </div>
    </q-card-section>
    <q-card-actions>
      <q-btn color="primary" label="Edit Exam" @click="editExam(exam.id)"/>
      <q-dialog v-model="showNoteDialog">
        <q-card>
          <q-card-section>
            <div class="text-h6">Full Note</div>
            <div>{{ exam?.note }}</div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="primary" label="Close" @click="showNoteDialog = false" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-card-actions>
  </q-card>

  <div class="q-ma-md allign-bottom">
      <q-btn color="primary" label="Create new Exam" @click="addExam" />
  </div>
  </div>
</q-intersection>

  <div v-else class="text-h4 flex-center">Choose date</div>
</q-page>
</template>
<script setup lang="ts">
import { ref, reactive, computed} from 'vue';
import { useExamDayStore } from 'src/stores/examDayStore';
import { useExamStore } from 'src/stores/examStore';
import { Loading, Notify } from 'quasar';
import { DayOfExams, Exam } from 'src/stores/db/types';

const examDayStore = useExamDayStore();
const examStore = useExamStore();

const examDays: DayOfExams[] = examDayStore.upcomingExamDays;
const exams: Exam[] = examStore.upcomingExams;

const examsRef = ref(exams);

const currentDate = new Date();

const state = reactive({
  show: false,
  selectedExamDay: undefined as DayOfExams | undefined,
  selectedDate : `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`,
  years: false,
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
      Loading.show({ message: 'Adding exam...', spinnerColor: 'amber', messageColor: 'amber', backgroundColor: 'black' });
      await examStore.createExam({
        venue: 'ICT Pro Brno',
        type: 'Computer',
        levels: ['B2', 'C1'],
        startTime: '07:00:00',
        endTime: '18:00:00',
        note: 'This will be very long note, so I can test if it will be displayed correctly. This will be very long note, so I can test if it will be displayed correctly.',
        dayOfExamsId: matchingExamDay.id,
      });

      await examStore.loadUpcomingExams();
      examsRef.value = examStore.upcomingExams;

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
  const exam = examsRef.value.find(exam => exam.id === examId);
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
const selectedExam = ref<Exam | null>(null);


const truncatedNote = (note: string | undefined) => {
  const maxLength = 25;
  if (note && note.length > maxLength) {
    return `${note.substring(0, maxLength)}`;
  }
  return note;
};

const shouldShowMoreLink = (note: string | undefined) => {
  const maxLength = 50; // You can adjust this value as per your preference
  return note && note.length > maxLength;
};

// Function to open the dialog with the full note
const showFullNoteDialog = () => {
  showNoteDialog.value = true;
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
</style>
