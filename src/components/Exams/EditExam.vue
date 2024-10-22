<template>
  <div class="exam-detail-container q-pa-md">
    <div class="exam-navigation q-mb-md">
      <q-btn flat color="primary" icon="arrow_back" label="Previous Exam" @click="navigateExam('prev')" :disable="!hasPreviousExam" />
      <div class="exam-counter text-subtitle1 text-bold">{{ today }}</div>
      <div class="exam-counter text-subtitle1 text-bold">Exam {{ currentExamIndex + 1 }} of {{ examsInDay.length }}</div>
      <q-btn flat color="primary" icon-right="arrow_forward" label="Next Exam" @click="navigateExam('next')" :disable="!hasNextExam" />
    </div>
  <div class="container">
    <q-card :class="['exam-card', 'q-ma-md', 'top-card', cardClass]" v-if="editableExam">
      <q-card-section>
        <b v-if="editableExam.isPrepared && !editableExam.isCompleted" class="text-green text-bold text-h5">This exam is marked as ready!</b>
        <b v-else-if="editableExam.isCompleted" class="text-orange text-bold text-h5">This exam is completed!</b>
        <div v-if="editmode">
          <q-btn
            color="grey"
            icon="arrow_back"
            @click="editmode = !editmode"
            round
            class="right q-mt-xs"
            size="xs"
          />
          <q-select
            v-model="editableExam.type"
            label="Type"
            :options="examTypes"
            transition-show="scale"
            transition-hide="scale"
            :disable="isExamLocked"
          />
          <q-select
            v-model="editableExam.location"
            label="Location"
            :options="examLocations"
            transition-show="scale"
            transition-hide="scale"
            @update:model-value="updateExamVenues"
            :disable="isExamLocked"
          />
          <q-select
            v-model="editableExam.venue"
            label="Venue"
            :options="examVenues"
            transition-show="scale"
            transition-hide="scale"
            :rules="[ (val) => !!val || 'Venue is required' ]"
            :disable="isExamLocked"
          />
          <q-select
            v-model="editableExam.levels"
            label="Levels"
            :options="levelOptions"
            transition-show="scale"
            transition-hide="scale"
            multiple
            counter
            use-chips
            :disable="isExamLocked"
          />
          <q-input
            v-model="editableExam.startTime"
            label="Start Time"
            type="time"
            :disable="isExamLocked"
          />
          <q-input
            v-model="editableExam.endTime"
            label="End Time"
            type="time"
            :disable="isExamLocked"
          />
          <q-input
            v-model="editableExam.note"
            label="Note"
            type="textarea"
            :disable="isExamLocked"
          />
        </div>
        <div v-else>
          <div class="text-h5">{{ exam.type }}</div>
          <div class="text-h5">{{ exam.location }} - {{ exam.venue }}</div>
          <div class="text-bold"> Levels:
            <q-chip
            v-for="level in exam.levels"
            :key="level"
            :color="getLevelColor(level)"
            size="12px"

          >
            {{ level }}
          </q-chip>
          </div>
          <div class="text-bold">
            Start time: {{ formatTimeString(exam.startTime) }}
          </div>
          <div class="text-bold">
            End time: {{ formatTimeString(exam.endTime) }}
          </div>
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
          </div>
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
        <q-btn
        v-if="!editmode"
        color="primary"
        icon="edit"
        @click="editmode = !editmode"
        round
        class="right q-mt-xs"
        :disable="isExamLocked"
      />
      <q-btn
        v-if="editmode"
        color="primary"
        icon="save"
        @click="saveChanges()"
        round
        class="right q-mt-xs"
        :disable="isExamLocked"
      />
      <q-separator class="q-my-sm" />
      <div v-for="(role, key) in roles" :key="key">
        {{ role.title }}:
        <div v-if="exam[key].length === 0">No {{ key }} assigned</div>
        <div
          class="text-bold"
          v-else
          v-for="person in exam[key]"
          :key="person.id"
        >
          {{ person.firstName }} {{ person.lastName }}
          <q-btn
            @click="removeFromExam(exam.id, person.id, role.title)"
            icon="remove"
            round
            color="negative"
            size="xs"
            :disable="isExamLocked"
          />
        </div>
      </div>
      <q-separator class="q-mt-sm" />

        <div>
          <q-file
            class="q-mt-md"
            flat
            multiple
            label="Select schedule files"
            color="primary"
            v-model="selectedFiles"
            @change="onFileChange"
          />
          <q-btn
            v-if="selectedFiles.length"
            class="q-mt-md float-right"
            color="primary"
            label="Upload Files"
            @click="uploadFiles"
          />
        </div>
        <div v-if="selectedFiles.length > 0" class="q-mt-md">
          <q-chip
            v-for="(file, index) in selectedFiles"
            :key="index"
            :label="file.name"
            removable
            @remove="removeFile(index)"
          />
        </div>
        <p class="text-h6 q-mt-sm">Files:</p>
        <div v-if="exam.files && exam.files.length > 0">
          <div v-for="file in exam.files" :key="file.id" class="q-mt-sm file-item">
            <q-icon :name="getFileIcon(file.name)" size="24px" class="q-mr-sm" />
            <span class="file-name">{{ file.name }}</span>
            <q-btn
              flat
              dense
              round
              icon="download"
              @click="downloadFile(file.id ?? 0, file.name)"
              :loading="file.id !== undefined ? loadingFiles[file.id] : false"
            >
              <template v-slot:loading>
                <q-spinner size="20px" />
              </template>
            </q-btn>
            <q-btn
              flat
              dense
              round
              color="negative"
              icon="delete"
              @click="deleteFile(file.id || 0, file.name)"
            />
          </div>
        </div>

        <q-separator class="q-my-sm" v-if="editableExam.dayReport" />
        <p v-if="editableExam.dayReport" class="text-h6 q-mt-sm">Exam Day Report:</p>
        <div v-if="editableExam.dayReport" class="q-mt-sm file-item">
          <q-icon name="picture_as_pdf" size="24px" class="q-mr-sm" />
          <span class="file-name">{{ editableExam.dayReport.name }}</span>
          <q-btn
            flat
            dense
            round
            icon="download"
            @click="downloadExamDayReport(editableExam.dayReport.id, editableExam.dayReport.name)"
            :loading="loadingFiles[editableExam.dayReport.id] ?? false"
          >
            <template v-slot:loading>
              <q-spinner size="20px" />
            </template>
          </q-btn>
          <q-btn
            flat
            dense
            round
            color="negative"
            icon="delete"
            @click="deleteFile(editableExam.dayReport.id, editableExam.dayReport.name)"
          />
        </div>
        <q-separator class="q-my-sm" />
        <q-btn
          :color="editableExam.isPrepared ? 'warning' : 'blue'"
          icon="event_available"
          :label="editableExam.isPrepared ? 'Unprepare Exam' : 'Prepare Exam'"
          @click="prepareExam()"
          class="q-ma-sm"
          rounded
        />
        <q-btn
          color="negative"
          label="Delete Exam"
          @click="deleteExam()"
          class="q-ma-sm"
          rounded
          :disable="isExamLocked"
        />
      </q-card-section>
    </q-card>

    <div class="override-section q-mt-md">
      <q-toggle class="text-h6" v-model="isOverrideActive" :disable="isExamLocked">
        Switch to override responses
      </q-toggle>
      <div class="row q-col-gutter-md">
        <div v-for="(role, key) in roles" :key="key" class="col-12">
          <q-card bordered>
            <q-card-section>
              <div class="text-h5 text-bold text-center">{{ role.title }}</div>
            </q-card-section>
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div v-for="answer in answers" :key="answer" class="col-xs-12 col-sm-6 col-md-3">
                  <q-card bordered :class="['response-card', getAnswerClass(answer)]">
                    <q-card-section>
                      <div class="text-h6 text-center">{{ roleTitles[answer] }}</div>
                    </q-card-section>
                    <q-card-section class="response-list">
                      <div v-for="response in filteredResponses(answer, [...role.filterRoles])" :key="response.id" class="response-item q-mb-sm">
                        <div v-if="!response.assigned" :class="['name-wrapper', 'q-pa-sm', 'rounded-borders', 'border']">
                           <div class="text-subtitle1 text-weight-bold">
                            <span :class="['clickable-name', getAnswerStyle(answer)]" @click="goToUserProfile(response.userId)">
                              {{ response.userName }}
                            </span>
                            <q-btn v-if="!response.assigned && (isOverrideActive || response.response !== 'No')"
                                   @click="addToExam(exam.id, response.userId, isOverrideActive, response.dayOfExamsId, role.title)"
                                   icon="add" round color="primary" size="xs" :disable="isExamLocked" class="q-ml-sm" />
                          </div>
                          <div class="text-caption">{{ response.userNote }}</div>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { dayResponse, Exam, Location, Venue, ExamTypeEnum, LevelEnum } from 'src/db/types';
import { ref, reactive, computed, watch } from 'vue';
import { formatTimeString } from 'src/helpers/FormatTime';
import { useExamStore } from 'src/stores/examStore';
import { useExamDayStore } from 'src/stores/examDayStore';
import { useRouter } from 'vue-router';
import { useAdminStore } from 'src/stores/adminStore';
import { Dialog, Notify } from 'quasar';
import { getLevelColor } from 'src/helpers/Color';
import { getFileIcon } from 'src/helpers/FileType';

const examStore = useExamStore();
const examDayStore = useExamDayStore();
const adminStore = useAdminStore();
const router = useRouter();

const props = defineProps<{
  exam: Exam;
  responses: dayResponse[];
}>();

const editableExam = ref<Exam | null>(props.exam ? { ...props.exam } : null);

const examTypes = Object.values(ExamTypeEnum);
const levelOptions = Object.values(LevelEnum);
const examLocations = ref<string[]>([]);
const examVenues = ref<string[]>([]);
const currentExamIndex = ref(0);
const examsInDay = ref<Exam[]>([]);
const hasPreviousExam = computed(() => currentExamIndex.value > 0);
const hasNextExam = computed(() => currentExamIndex.value < examsInDay.value.length - 1);
const today = props.exam.startTime.split('T')[0].split('-').reverse().join('.');

const fetchExamsForDay = async () => {
  if (props.exam && props.exam.dayOfExamsId) {
    await examStore.getExamsForDay(props.exam.dayOfExamsId);
    examsInDay.value = examStore.pastExams;
    currentExamIndex.value = examsInDay.value.findIndex(e => e.id === props.exam.id);
  }
};

const navigateExam = async (direction: 'prev' | 'next') => {
  if (direction === 'prev' && hasPreviousExam.value) {
    currentExamIndex.value--;
  } else if (direction === 'next' && hasNextExam.value) {
    currentExamIndex.value++;
  }
  const newExam = examsInDay.value[currentExamIndex.value];
  if (newExam) {
    await router.push(`/admin/exams/${newExam.id}`);
    await examStore.getExam(newExam.id);
    initializeEditableExam();
  }
};

const isExamLocked = computed(() => {
  return editableExam.value?.isPrepared || editableExam.value?.isCompleted;
});

const initializeLocations = () => {
  examLocations.value = adminStore.locationsWithVenues.map((location: Location) => location.name);
};

const updateExamVenues = () => {
  if (editableExam.value) {
    const selectedLoc = adminStore.locationsWithVenues.find(
      (location: Location) => location.name === editableExam.value?.location
    );

    if (selectedLoc) {
      examVenues.value = selectedLoc.venues.map((venue: Venue) => venue.name);
    } else {
      examVenues.value = [];
    }
  }
};

const initializeEditableExam = () => {
  if (props.exam) {
    const formattedExam = {
      ...props.exam,
      startTime: formatTimeString(props.exam.startTime),
      endTime: formatTimeString(props.exam.endTime),
    };
    editableExam.value = formattedExam;
    updateExamVenues();
  }
};

fetchExamsForDay();
initializeLocations();
initializeEditableExam();

watch(() => editableExam.value?.location, updateExamVenues);

const selectedFiles = ref<File[]>([]);
const loadingFiles = reactive<{ [key: number]: boolean }>({});
const showNoteDialog = ref(false);
const editmode = ref(false);

const roles = {
  supervisors: { title: 'Supervisor', filterRoles: ['Supervisor', 'Office'] },
  invigilators: {
    title: 'Invigilator',
    filterRoles: ['Supervisor', 'Invigilator', 'Office'],
  },
  examiners: { title: 'Examiner', filterRoles: ['Examiner'] },
} as const;

const roleTitles = {
  Yes: 'Confirmed',
  AM: 'Morning',
  PM: 'Afternoon',
  No: 'Unavailable',
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

const addToExam = async (
  examId: number,
  userId: number,
  override: boolean,
  dayId: number,
  position: string
) => {
  if (!isExamLocked.value) {
    await examStore.addWorker(examId, userId, override, position);
    await examDayStore.loadResponsesForExamDay(dayId);
    await examStore.getExam(examId);
  }
};

const removeFromExam = async (
  examId: number,
  userId: number,
  position: string
) => {
  if (!isExamLocked.value) {
    await examStore.removeWorker(examId, userId, position);
    await examStore.getExam(examId);
    const dayId = props.responses[0].dayOfExamsId;
    await examDayStore.loadResponsesForExamDay(dayId);
  }
};

const onFileChange = (files: File[]) => {
  if (files && files.length > 0) {
    selectedFiles.value = files;
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const uploadFiles = async () => {
  if (selectedFiles.value.length > 0) {
    for (const file of selectedFiles.value) {
      await examStore.uploadExamSchedule(file, props.exam.id);
    }
    selectedFiles.value = [];

    await examStore.getExam(props.exam.id);
    initializeEditableExam();
  }
};

const downloadExamDayReport = async (fileId: number, fileName: string) => {
  if (fileId === undefined) {
    Notify.create({
      message: 'Invalid fileId: cannot be undefined',
      color: 'negative',
    });
    return;
  }
  loadingFiles[fileId] = true;
  try {
    await examStore.downloadExamDayReport(fileId, fileName);
  } finally {
    loadingFiles[fileId] = false;
  }
};


const downloadFile = async (fileId: number, fileName: string) => {
  if (fileId === undefined) {
    Notify.create({
      message: 'Invalid fileId: cannot be undefined',
      color: 'negative',
    });
    return;
  }
  loadingFiles[fileId] = true;
  try {
    await examStore.downloadExamFile(fileId, fileName);
  } finally {
    loadingFiles[fileId] = false;
  }
};

const answers: RoleTitleKey[] = ['Yes', 'AM', 'PM', 'No'];

const filteredResponses = (answer: RoleTitleKey, filterRoles: string[]) => {
  return props.responses.filter((response) => {
    if (filterRoles.includes('Examiner')) {
      const isValidLevel = response.userLevel.some((level) =>
        props.exam.levels.includes(level)
      );
      if (!isValidLevel) return false;
    }
    return (
      response.response === answer &&
      (filterRoles.length === 0 ||
        filterRoles.some((role) => response.userRole.includes(role)))
    );
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

const saveChanges = async () => {
  if (editableExam.value && !isExamLocked.value) {
    await examStore.updateExam(editableExam.value);
    await examStore.getExam(editableExam.value.id);
    initializeEditableExam();
    editmode.value = false;
  }
};

const prepareExam = async () => {
  if(!editableExam.value?.isPrepared)
  Dialog.create({
    title: 'Prepare Exam',
    message: 'You want to inform all workers about this exam? It is recommended to not edit the exam after preparing it.',
    ok: {
      label: 'Yes',
      color: 'positive',
    },
    cancel: {
      label: 'No',
      color: 'negative',
    },
  }).onOk(async () => {
    if(!editableExam.value?.files || editableExam.value?.files.length === 0 && !editableExam.value.isPrepared) {
      Dialog.create({
        title: 'No Files',
        message: 'You need to upload files before preparing the exam.',
        ok: {
          label: 'OK',
          color: 'positive',
        },
      });
    }
    else if(!editableExam.value?.supervisors || !editableExam.value?.invigilators || !editableExam.value?.examiners) {
      Dialog.create({
        title: 'No Workers',
        message: 'You need to assign workers before preparing the exam.',
        ok: {
          label: 'OK',
          color: 'positive',
        },
      });
    }
    else if (editableExam.value) {
      await examStore.updatePrepared(editableExam.value.id, !editableExam.value.isPrepared);
      await examStore.getExam(editableExam.value.id);
      initializeEditableExam();
    }
  });

  else {
    Dialog.create({
      title: 'Unprepare Exam',
      message: 'You want to unprepare this exam? When you will prepare it again, all workers will be informed again.',
      ok: {
        label: 'Yes',
        color: 'positive',
      },
      cancel: {
        label: 'No',
        color: 'negative',
      },
    }).onOk(async () => {
      if (editableExam.value) {
        await examStore.updatePrepared(editableExam.value.id, !editableExam.value.isPrepared);
        await examStore.getExam(editableExam.value.id);
        initializeEditableExam();
      }
    });
  }
};

const complete = async () => {
  Dialog.create({
    title: 'Complete Exam',
    message: 'You want to change completion of this exam?',
    ok: {
      label: 'Yes',
      color: 'positive',
    },
    cancel: {
      label: 'No',
      color: 'negative',
    },
  }).onOk(async () => {
    if (editableExam.value) {
      await examStore.updateCompleted(editableExam.value.id, !editableExam.value.isCompleted);
      await examStore.getExam(editableExam.value.id);
      initializeEditableExam();
    }
  });
};

const deleteExam = async () => {
  Dialog.create({
    title: 'Delete Exam',
    message: 'You want to delete this exam? This action cannot be undone!',
    ok: {
      label: 'Yes',
      color: 'positive',
    },
    cancel: {
      label: 'No',
      color: 'negative',
    },
  }).onOk(async () => {
    if (editableExam.value) {
      await examStore.deleteExam(editableExam.value.id);
      router.push('/admin/exams');
    }
  });
};

const deleteFile = async (fileId: number, fileName: string) => {
  Dialog.create({
    title: 'Delete File',
    message: `You want to delete ${fileName} file?`,
    ok: {
      label: 'Yes',
      color: 'negative',
    },
    cancel: {
      label: 'No',
      color: 'primary',
    },
  }).onOk(async () => {
    if (fileId) {
      await examStore.deleteExamFile(fileId);
      await examStore.getExam(props.exam.id);
      initializeEditableExam();
    }
  });
};

const cardClass = computed(() => {
  if (editableExam.value?.isPrepared && !editableExam.value?.isCompleted) {
    return 'is-prepared';
  } else if (editableExam.value?.isCompleted) {
    return 'is-completed';
  } else {
    return '';
  }
});

const getAnswerClass = (answer: RoleTitleKey) => {
  switch (answer) {
    case 'Yes':
      return 'bg-green-1';
    case 'AM':
      return 'bg-yellow-1';
    case 'PM':
      return 'bg-blue-1';
    case 'No':
      return 'bg-red-1';
    default:
      return '';
  }
};

</script>
<style scoped lang="scss">
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
  gap: 4rem;
}

.responsive-column {
  flex: 1 1 calc(1% - 1rem);
}

.name-wrapper {
  max-width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
  transition: all 0.2s ease;

  &.answer-yes {
    background-color: rgba(76, 175, 80, 0.1);
    border-left: 4px solid #4CAF50;
  }

  &.answer-am {
    background-color: rgba(255, 235, 59, 0.1);
    border-left: 4px solid #FFEB3B;
  }

  &.answer-pm {
    background-color: rgba(33, 150, 243, 0.1);
    border-left: 4px solid #2196F3;
  }

  &.answer-no {
    background-color: rgba(244, 67, 54, 0.1);
    border-left: 4px solid #F44336;
  }

}

.clickable-name {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
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
.clickable-name {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}

.exam-card {
  transition: all 0.3s ease;
  border-left: 5px solid $grey-5;

  &.is-prepared {
    border-left-color: $positive;
  }
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  max-width: 15rem;
  background-color: rgba(0, 0, 0, 0.03);
  margin-bottom: 8px;
}

.file-name {
  flex-grow: 1;
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exam-detail-container {
  max-width: 1600px;
  margin: 0 auto;
}

.exam-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 8px 16px;
}

.border{
  border: 1.5px solid #adadad;
  border-radius: 4px;
}

.exam-info-card, .staff-assignment-card {
  height: 100%;
}

.exam-info-card {
  border-left: 5px solid $grey-5;
  transition: all 0.3s ease;

  &.exam-ready {
    border-left-color: $positive;
  }
}

.response-item {
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.response-list {
  flex-grow: 1;
  overflow-y: auto;
  max-height: 300px;
}

.response-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
}

.file-item {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: $grey-2;
  }
}

@media (max-width: 1023px) {
  .exam-navigation {
    flex-direction: column;
    align-items: stretch;
  }

  .exam-counter {
    order: -1;
    text-align: center;
    margin-bottom: 8px;
  }
}
</style>
