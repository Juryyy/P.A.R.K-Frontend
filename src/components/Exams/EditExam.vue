<template>
  <q-card bordered class="q-ma-md" >
    <q-card-section>
      <div class="text-h5">{{ exam.location }}</div>
      <div class="text-h6">Venue: {{ exam.venue }}</div>
      <div>Type: {{ exam.type }}</div>
      <div>Levels: {{ exam.levels.join(', ') }}</div>
      <div>Start time: {{ formatTime(exam.startTime) }}</div>
      <div>End time: {{ formatTime(exam.endTime) }}</div>
      <div>
        Note:
        <span>
          {{ exam.note }}
        </span>
      </div>
      <q-separator />
      <div v-for="(role, key) in roles" :key="key">
        {{ role.title }}:
        <div v-if="exam[key].length === 0">
          No {{ key }} assigned
        </div>
        <div class="text-bold" v-else v-for="person in exam[key]" :key="person.id">
          {{ person.firstName }} {{ person.lastName }}
          <q-btn @click="removeFromExam(exam.id, person.id, role.title)" icon="remove" round color="negative" size="xs" />
        </div>
      </div>
    </q-card-section>
  </q-card>

  <div>
    <q-toggle class="text-h6" v-model="isOverrideActive">
      Switch to override responses
    </q-toggle>
    <div v-for="(role, key) in roles" :key="key">
      <q-card bordered class="q-ma-md">
        <div class="text-h5 text-bold q-ml-md q-mt-md text-center">{{ role.title }}</div>
        <q-card-section>
          <div class="responsive-columns">
            <div v-for="answer in answers" :key="answer" class="responsive-column">
              <q-card bordered class="q-ma-xs" :style="getAnswerStyle(answer)">
                <div class="text-h5 q-ma-sm text-center">{{ roleTitles[answer] }}</div>
                <q-separator class="q-mx-sm" />
                <q-card-section>
                  <div v-for="response in filteredResponses(answer, [...role.filterRoles])" :key="response.id">
                    <div v-if="!response.assigned" class="text-h6 text-weight-bold name-wrapper">
                      {{ response.userName }}
                      <q-btn v-if="!response.assigned && (isOverrideActive || response.response !== 'No')" @click="addToExam(exam.id, response.userId, isOverrideActive, response.dayOfExamsId, role.title)" icon="add" round color="primary" size="xs" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dayResponse, Exam } from 'src/stores/db/types';
import { ref } from 'vue';
import { formatTime } from 'src/helpers/formatTime';
import { useExamStore } from 'src/stores/examStore';
import { useExamDayStore } from 'src/stores/examDayStore';

const examStore = useExamStore();
const examDayStore = useExamDayStore();

const props = defineProps<{
  exam: Exam;
  responses: dayResponse[];
}>();

const roles = {
  supervisors: { title: 'Supervisor', filterRoles: ['Supervisor', 'Office'] },
  invigilators: { title: 'Invigilator', filterRoles: ['Supervisor', 'Invigilator', 'Office'] },
  examiners: { title: 'Examiner', filterRoles: ['Examiner'] }
} as const;

const roleTitles = {
  Yes: 'Confirmed',
  AM: 'Morning',
  PM: 'Afternoon',
  No: 'Declined'
} as const;

type RoleTitleKey = keyof typeof roleTitles;

const addToExam = async (examId: number, userId: number, override: boolean, dayId: number, position: string) => {
  await examStore.addWorker(examId, userId, override, position);
  await examDayStore.loadResponsesForExamDay(dayId);
  await examStore.getExam(examId);
};

const removeFromExam = async (examId: number, userId: number, position: string) => {
  await examStore.removeWorker(examId, userId, position);
  await examStore.getExam(examId);
  //from responses[0] get dayId
  const dayId = props.responses[0].dayOfExamsId;
  await examDayStore.loadResponsesForExamDay(dayId);
};

const answers: RoleTitleKey[] = ['Yes', 'AM', 'PM', 'No'];

const filteredResponses = (answer: RoleTitleKey, filterRoles: string[]) => {
  return props.responses.filter(
    response => response.response === answer && (filterRoles.length === 0 || filterRoles.some(role => response.userRole.includes(role)))
  );
};

const isOverrideActive = ref(false);

const getAnswerStyle = (answer: RoleTitleKey) => {
  switch (answer) {
    case 'Yes':
      return { backgroundColor: '#e8f5e9' }; // Light Green
    case 'AM':
      return { backgroundColor: '#fffde7' }; // Light Yellow
    case 'PM':
      return { backgroundColor: '#e3f2fd' }; // Light Blue
    case 'No':
      return { backgroundColor: '#ffebee' }; // Light Red
    default:
      return {};
  }
};
</script>

<style scoped>
.responsive-columns {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.responsive-column {
  flex: 1 1 calc(50% - 1rem);
}

.name-wrapper {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

@media (min-width: 600px) {
  .responsive-column {
    flex: 1 1 calc(25% - 1rem);
  }
}
</style>
