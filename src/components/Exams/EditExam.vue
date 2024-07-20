<template>
  <div class="container">
    <q-card bordered class="q-ma-md top-card">
      <q-card-section>
        <div class="text-h4">{{ exam.type }}</div>
        <div class="text-h5">{{ exam.location }} - {{ exam.venue }}</div>
        <div class="text-bold">Levels: {{ exam.levels.join(', ') }}</div>
        <div class="text-bold">Start time: {{ formatTime(exam.startTime) }}</div>
        <div class="text-bold">End time: {{ formatTime(exam.endTime) }}</div>
        <div class="text-bold">
          Note:
          <b
            v-if="shouldShowMoreLink(exam.note)"
            @click="showFullNoteDialog()"
          >
            {{ truncatedNote(exam.note) }}
            <span class="more-link">...more</span>
          </b>
          <b v-else>
            <b>{{ exam.note }}</b>
          </b>

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

        </div>
        <q-separator class="q-my-sm"  />
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
        <q-separator class="q-mt-sm" />

        <q-uploader
          class="q-mt-md"
          flat
          label="Upload schedule"
          color="primary"
          :url="examScheduleUrl"
          auto-upload
          no-thumbnails
        />
      </q-card-section>
    </q-card>

    <div class="override-section">
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
                      <div v-if="!response.assigned" class="name-wrapper border">
                        <div class="text-h6 text-weight-bold" >
                          <span class="clickable-name q-pr-xs" @click="goToUserProfile(response.userId)">
                          {{ response.userName }}
                        </span>
                        <q-btn v-if="!response.assigned && (isOverrideActive || response.response !== 'No')" @click="addToExam(exam.id, response.userId, isOverrideActive, response.dayOfExamsId, role.title)" icon="add" round color="primary" size="xs" />
                        </div>
                        {{ response.userNote }}
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
  </div>
</template>

<script setup lang="ts">
import { dayResponse, Exam } from 'src/stores/db/types';
import { ref } from 'vue';
import { formatTime } from 'src/helpers/FormatTime';
import { useExamStore } from 'src/stores/examStore';
import { useExamDayStore } from 'src/stores/examDayStore';
import { useRouter } from 'vue-router';

const examStore = useExamStore();
const examDayStore = useExamDayStore();
const router = useRouter();

const props = defineProps<{
  exam: Exam;
  responses: dayResponse[];
}>();

const examScheduleUrl = `${process.env.VUE_APP_API_URL}/exams/schedule/${props.exam.id}`;
const showNoteDialog = ref(false);

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

const shouldShowMoreLink = (note: string | undefined) => {
  const maxLength = 19;
  return note && note.length > maxLength;
};

const showFullNoteDialog = () => {
  showNoteDialog.value = true;
};

const truncatedNote = (note: string | undefined) => {
  const maxLength = 19;
  if (note && note.length > maxLength) {
    return `${note.substring(0, maxLength)}`;
  }
  return note;
};

const addToExam = async (examId: number, userId: number, override: boolean, dayId: number, position: string) => {
  await examStore.addWorker(examId, userId, override, position);
  await examDayStore.loadResponsesForExamDay(dayId);
  await examStore.getExam(examId);
};

const removeFromExam = async (examId: number, userId: number, position: string) => {
  await examStore.removeWorker(examId, userId, position);
  await examStore.getExam(examId);
  const dayId = props.responses[0].dayOfExamsId;
  await examDayStore.loadResponsesForExamDay(dayId);
};

const answers: RoleTitleKey[] = ['Yes', 'AM', 'PM', 'No'];

const filteredResponses = (answer: RoleTitleKey, filterRoles: string[]) => {
  return props.responses.filter(response => {
    if (filterRoles.includes('Examiner')) {
      // Check if user level matches any of the exam levels
      const isValidLevel = response.userLevel.some(level => props.exam.levels.includes(level));
      if (!isValidLevel) return false;
    }
    return response.response === answer && (filterRoles.length === 0 || filterRoles.some(role => response.userRole.includes(role)));
  });
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

const goToUserProfile = (userId: number) => {
  router.push(`/user/${userId}`);
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
}

.top-card {
  flex: 1;
  margin-bottom: 1rem;
}

.override-section {
  flex: 2;
}

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
  .container {
    flex-direction: row;
  }

  .top-card {
    max-width: 50%;
    margin-right: 1rem;
    margin-bottom: 0;
  }

  .override-section {
    flex: 2;
  }

  .responsive-column {
    flex: 1 1 calc(25% - 1rem);
  }
}

.border {
  border: 1px solid #cacaca;
  border-radius: 5px;
  margin: 0.5rem;
  padding: 0.5rem;
}

.clickable-name {
  cursor: pointer;
}
</style>
