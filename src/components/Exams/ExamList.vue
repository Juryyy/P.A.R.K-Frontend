<!--Currently not used, reusable for another purpose-->
<template>
  <div class="container">
    <div v-for="examDay in examDays" :key="examDay.id" class="container">
      <q-btn class="menu-btn"
        :label="`Date: ${new Date(examDay.date).toLocaleDateString()}`"
        @click="showDetails(examDay)"
      />
      <q-form class="" v-model="state.show" v-if="state.selectedExamDay && state.selectedExamDay.id === examDay.id" persistent @hide="hideDetails">
        <q-card>
          <q-card-section>
            <div class="text-h6">Exams for {{ new Date(state.selectedExamDay.date).toLocaleDateString() }} :</div>
            <q-form>
            <q-card v-for="exam in filteredExams" :key="exam.id">
              <q-card-section>
                <div class="text-h6">Exam type: {{ exam.type }}</div>
                <div class="text-h6">Exam venue: {{ exam.venue }}</div>
                <div class="text-h6">Exam levels: {{ exam.levels.join(', ') }}</div>
                <div class="text-h6">Exam start time: {{ formatTime(exam.startTime) }}</div>
                <div class="text-h6">Exam end time: {{ formatTime(exam.endTime) }}</div>
                <div class="text-h6">Exam note: {{ exam.note }}</div>
              </q-card-section>
            </q-card>
            </q-form>
          </q-card-section>
          <q-card-actions>
            <q-btn flat label="Close" @click="hideDetails" />
            <q-btn flat label="Add exam" @click="addExam" />
          </q-card-actions>
        </q-card>
      </q-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useExamDayStore } from 'src/stores/examDayStore';
import { reactive, computed} from 'vue';
import { DayOfExams, Exam }from 'src/stores/db/types';
import { useExamStore } from 'src/stores/examStore';
import { Loading } from 'quasar';

const examDayStore = useExamDayStore();
const examStore = useExamStore();

const examDays : DayOfExams[] = examDayStore.upcomingExamDays;
const exams : Exam[] = examStore.upcomingExams;

console.log(exams)

const state = reactive({
  show: false,
  selectedExamDay: undefined as DayOfExams | undefined,
});

const showDetails = (examDay: DayOfExams) => {
  state.selectedExamDay = examDay;
  state.show = true;
};

const hideDetails = () => {
  state.show = false;
  state.selectedExamDay = undefined;
};

const addExam = async () => {
  Loading.show({message:'Adding exam...', spinnerColor: 'amber', messageColor: 'amber', backgroundColor: 'black'});
  await examStore.createExam({
    venue: 'ICT Pro Brno',
    type: 'Computer',
    levels: ['B2', 'C1'],
    startTime: '07:00:00',
    endTime: '18:00:00',
    note: 'Test note',
    dayOfExamsId: state.selectedExamDay?.id,
  });
  Loading.hide();
};

const filteredExams = computed(() => {
  if (state.selectedExamDay) {
    const response = exams.filter((exam) => exam.dayOfExamsId === state.selectedExamDay?.id);
    console.log('Filtered exams:', response);
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
<style setup lang="scss">
.container{
  width: 100%;
  padding: 10px;
}

.menu-btn {
  background-color: $primary;
  border-radius: 10px;
  font-size: 20px;
  font-weight: bold;
  width: 100%;
  box-sizing: border-box;
  &:hover {
    background-color: $primary-secondary;
  }
}
</style>
