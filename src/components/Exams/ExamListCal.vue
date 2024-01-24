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
      <div>Note: {{ exam.note }}</div>
    </q-card-section>
    <q-card-actions>
      <q-btn color="primary" label="Edit Exam" />
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
  qDate: null as Date | null,
  selectedDate : `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`
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
        note: 'Test note',
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
