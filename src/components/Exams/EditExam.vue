<template>
  <div class="exam-detail-container q-pa-md">
    <!-- Navigation Section -->
    <div class="exam-navigation q-mb-md">
      <q-btn flat color="primary" icon="arrow_back" label="Previous Exam"
             @click="navigateExam('prev')" :disable="!hasPreviousExam" />
      <div class="exam-counter text-subtitle1 text-bold">{{ today }}</div>
      <div class="exam-counter text-subtitle1 text-bold">
        Exam {{ currentExamIndex + 1 }} of {{ examsInDay.length }}
      </div>
      <q-btn flat color="primary" icon-right="arrow_forward" label="Next Exam"
             @click="navigateExam('next')" :disable="!hasNextExam" />
    </div>

    <div class="container">
      <!-- Main Exam Card -->
      <q-card :class="['exam-card', cardClass, 'q-mb-xl', 'q-pb-md']" v-if="editableExam">
        <q-card-section>
          <!-- Status Badge -->
          <div v-if="editableExam.isPrepared && !editableExam.isCompleted"
               class="status-badge ready-badge q-mb-md">
            <q-icon name="check_circle" color="green" size="md" class="q-mr-sm"/>
            <span class="text-green text-bold text-subtitle1">This exam is marked as ready!</span>
          </div>
          <div v-else-if="editableExam.isCompleted"
               class="status-badge complete-badge q-mb-md">
            <q-icon name="event_available" color="orange" size="md" class="q-mr-sm"/>
            <span class="text-orange text-bold text-subtitle1">This exam is completed!</span>
          </div>


          <!-- Edit Mode -->
          <div v-if="editmode" class="edit-form q-gutter-y-md">
            <div class="row justify-end">
              <q-btn color="grey" icon="arrow_back" @click="editmode = !editmode"
                     round size="md" class="q-mb-sm"/>
            </div>

            <q-select v-model="editableExam.type" label="Type" :options="examTypes"
                     outlined dense :disable="isExamLocked"/>

            <q-select v-model="editableExam.location" label="Location"
                     :options="examLocations" outlined dense
                     @update:model-value="updateExamVenues"
                     :disable="isExamLocked"/>

            <q-select v-model="editableExam.venue" label="Venue"
                     :options="examVenues" outlined dense
                     :rules="[(val) => !!val || 'Venue is required']"
                     :disable="isExamLocked"/>

            <q-select v-model="editableExam.levels" label="Levels"
                     :options="levelOptions" outlined dense multiple
                     counter use-chips :disable="isExamLocked"/>

            <q-input v-model="editableExam.startTime" label="Start Time"
                    type="time" outlined dense :disable="isExamLocked"/>

            <q-input v-model="editableExam.endTime" label="End Time"
                    type="time" outlined dense :disable="isExamLocked"/>

            <q-input v-model="editableExam.note" label="Note"
                    type="textarea" outlined dense :disable="isExamLocked"/>

            <div class="row justify-end">
                      <q-btn v-if="editmode" color="primary" icon="save"
                      @click="saveChanges()" round size="md"
                      :disable="isExamLocked" class="q-ml-sm"/>
            </div>
          </div>



          <!-- View Mode -->
          <div v-else class="exam-info q-mb-lg">
            <div class="row text-h5 text-weight-bold q-mb-sm">{{ exam.type }}

          <!-- Edit/Save Buttons -->
          <div class="justify-end">
            <q-btn v-if="!editmode" color="primary" icon="edit"
                   @click="editmode = !editmode" round size="sm"
                   :disable="isExamLocked" class="q-ml-sm"/>
          </div>
            </div>
            <div class="location-info q-mb-md">
              <q-icon name="location_on" color="grey-7" size="md" class="q-mr-xs"/>
              <span class="text-subtitle1 text-grey-8">
                {{ exam.location }} - {{ exam.venue }}
              </span>
            </div>

            <!-- Levels -->
            <div class="levels-section q-mb-md">
              <div class="row items-center q-mb-xs">
                <q-icon name="school" color="primary" size="sm" class="q-mr-xs"/>
                <span class="text-subtitle2 text-weight-medium">Levels:</span>
              </div>
              <div class="row q-gutter-xs">
                <q-chip v-for="level in exam.levels" :key="level"
                       :color="getLevelColor(level)"
                       text-color="white" size="md" dense>
                  {{ level }}
                </q-chip>
              </div>
            </div>

            <!-- Time Details -->
            <div class="time-details q-pa-sm bg-grey-2 rounded-borders q-mb-md">
              <div class="row items-center q-mb-xs">
                <q-icon name="schedule" color="primary" size="sm" class="q-mr-xs"/>
                <div class="column">
                  <div class="text-caption text-grey-7">Start time</div>
                  <div class="text-subtitle2 text-weight-medium">
                    {{ formatTimeString(exam.startTime) }}
                  </div>
                </div>
              </div>
              <div class="row items-center">
                <q-icon name="update" color="primary" size="sm" class="q-mr-xs"/>
                <div class="column">
                  <div class="text-caption text-grey-7">End time</div>
                  <div class="text-subtitle2 text-weight-medium">
                    {{ formatTimeString(exam.endTime) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Note -->
            <div v-if="exam.note" class="note-section bg-blue-1 q-pa-sm rounded-borders q-mb-md">
              <div class="row items-start">
                <q-icon name="notes" color="primary" size="sm" class="q-mr-xs q-mt-xs"/>
                <div class="column">
                  <div class="text-caption text-grey-8">Note:</div>
                  <div class="text-subtitle2">
                   <!-- <span v-if="shouldShowMoreLink(exam.note)"
                          @click="showFullNoteDialog()"
                          class="cursor-pointer">
                      {{ truncatedNote(exam.note) }}
                      <span class="text-primary">...more</span>
                    </span>
                    <span v-else>{{ exam.note }}</span>-->
                    <span class="break-word">{{ exam.note }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Personnel Section -->
          <q-separator class="q-my-md" />
          <div v-for="(role, key) in roles" :key="key" class="personnel-section q-mb-md">
            <div class="row items-center q-mb-xs">
              <q-icon :name="getRoleIcon(key)" color="primary" size="sm" class="q-mr-xs"/>
              <span class="text-subtitle2 text-weight-medium">{{ role.title }}:</span>
            </div>

            <div v-if="exam[key].length === 0"
                 class="empty-state q-pa-xs bg-grey-2 rounded-borders text-grey-7 text-caption">
              No {{ key }} assigned
            </div>

            <div v-else class="personnel-cards">
              <div v-for="person in exam[key]" :key="person.id"
                   class="personnel-card q-pa-xs q-mb-xs">
                <div class="row items-center justify-between">
                  <div class="row items-center">
                    <span class="q-ml-xs text-subtitle2">
                      {{ person.firstName }} {{ person.lastName }}
                    </span>
                  </div>
                  <q-btn @click="removeFromExam(exam.id, person.id, role.title)"
                         icon="remove" round color="negative" size="xs"
                         :disable="isExamLocked"/>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule Section -->
          <q-separator class="q-my-md" />
          <div class="schedule-section">
            <template v-if="!editableExam.schedule">
              <div class="row items-center">
                <q-input v-model="scheduleUrl" class="col-grow"
                        label="Schedule URL" type="url" outlined dense
                        :rules="[val => /^https?:\/\/.+/.test(val) || 'Must be a valid URL']">
                  <template v-slot:append>
                    <q-btn icon="save" round size="sm" color="primary"
                           @click="saveScheduleUrl"
                           :disable="!scheduleUrl || !scheduleUrl.trim()"/>
                  </template>
                </q-input>
              </div>
            </template>
            <template v-else>
              <q-card flat bordered class="schedule-card">
                <q-card-section horizontal class="q-pa-sm">
                  <q-card-section class="col q-pa-sm">
                    <div class="row items-center">
                      <q-icon name="event" size="md" color="primary" class="q-mr-xs"/>
                      <div class="text-subtitle1 text-primary">Exam Schedule</div>
                    </div>
                    <p class="text-caption text-grey-8 q-mt-xs q-mb-none">
                      View detailed timing and arrangements
                    </p>
                  </q-card-section>
                  <q-card-section class="col-auto q-pa-sm">
                    <q-btn :href="editableExam.schedule" target="_blank"
                           rel="noopener noreferrer" color="primary"
                           class="schedule-button" icon-right="open_in_new"
                           size="md" no-caps>
                      Open Schedule
                    </q-btn>
                    <q-btn icon="delete" round size="md" color="negative"
                           @click="removeSchedule" :disable="isExamLocked"
                           class="q-ml-sm"/>
                  </q-card-section>
                </q-card-section>
              </q-card>
            </template>
          </div>

          <!-- Files Section -->
          <q-separator class="q-my-md"/>
          <div class="files-section">
            <div class="row items-center q-mb-sm">
              <q-icon name="attachment" color="primary" size="sm" class="q-mr-xs"/>
              <span class="text-subtitle1">Files</span>
            </div>

            <q-file class="q-mb-sm" flat multiple label="Select files"
                    color="primary" v-model="selectedFiles"
                    @change="onFileChange" :disable="isExamLocked"/>

            <q-btn v-if="selectedFiles.length" class="q-mb-md float-right"
                   color="primary" label="Upload Files" size="md"
                   @click="uploadFiles"/>

            <div v-if="selectedFiles.length > 0" class="q-mb-md">
              <q-chip v-for="(file, index) in selectedFiles" :key="index"
                     :label="file.name" removable size="md"
                     @remove="removeFile(index)"/>
            </div>

            <div v-if="exam.files && exam.files.length > 0" class="file-cards">
              <div v-for="file in exam.files" :key="file.id"
                   class="file-card q-mb-xs">
                <div class="row items-center justify-between q-pa-xs">
                  <div class="row items-center">
                    <q-icon :name="getFileIcon(file.name)" size="18px"
                           class="q-mr-xs text-primary"/>
                    <span class="file-name text-subtitle2">{{ file.name }}</span>
                  </div>
                  <div>
                    <q-btn flat dense round size="md" icon="download"
                           @click="downloadFile(file.id ?? 0, file.name)"
                           :loading="file.id !== undefined ? loadingFiles[file.id] : false">
                      <template v-slot:loading>
                        <q-spinner size="16px"/>
                      </template>
                    </q-btn>
                    <q-btn flat dense round size="md" color="negative"
                           icon="delete" @click="deleteFile(file.id || 0, file.name)"/>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Day Report Section -->
          <template v-if="editableExam.dayReport">
            <q-separator class="q-my-md"/>
            <div class="day-report-section">
              <div class="row items-center q-mb-sm">
                <q-icon name="description" color="primary" size="sm" class="q-mr-xs"/>
                <span class="text-subtitle1">Exam Day Report</span>
              </div>

              <div class="file-card">
                <div class="row items-center justify-between q-pa-xs">
                  <div class="row items-center">
                    <q-icon name="picture_as_pdf" size="18px"
                           class="q-mr-xs text-red"/>
                    <span class="file-name text-subtitle2">
                      {{ editableExam.dayReport.name }}
                    </span>
                  </div>
                  <div>
                    <q-btn flat dense round size="md" icon="download"
                           @click="downloadExamDayReport(editableExam.dayReport.id, editableExam.dayReport.name)"
                           :loading="loadingFiles[editableExam.dayReport.id] ?? false">
                      <template v-slot:loading>
                        <q-spinner size="16px"/>
                      </template>
                    </q-btn>
                    <q-btn flat dense round size="md" color="negative"
                           icon="delete" @click="deleteFile(editableExam.dayReport.id, editableExam.dayReport.name)"/>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Action Buttons -->
          <div class="row justify-start q-mt-md q-gutter-sm">
            <q-btn :color="editableExam.isPrepared ? 'warning' : 'blue'"
                   icon="event_available"
                   :label="editableExam.isPrepared ? 'Unprepare Exam' : 'Prepare Exam'"
                   @click="prepareExam()"
                   size="md"
                   rounded/>
            <q-btn color="negative"
                   label="Delete Exam"
                   @click="deleteExam()"
                   size="md"
                   rounded
                   :disable="isExamLocked"/>
          </div>
        </q-card-section>
      </q-card>

      <!-- Assignment Section -->
      <div class="override-section q-mt-md">
        <div class="row items-center q-mb-md">
          <q-toggle v-model="isOverrideActive"
                   :disable="isExamLocked"
                   class="text-subtitle1"/>
          <span class="q-ml-sm text-subtitle1">Switch to override responses</span>
        </div>

        <div class="row q-col-gutter-md">
          <div v-for="(role, key) in roles" :key="key" class="col-12">
            <q-card bordered class="role-card">
              <q-card-section class="q-py-sm">
                <div class="text-h6 text-bold text-center">{{ role.title }}</div>
              </q-card-section>

              <q-card-section>
                <div class="row q-col-gutter-md">
                  <div v-for="answer in answers" :key="answer"
                       class="col-xs-12 col-sm-6 col-md-3">
                    <q-card bordered class="response-card"
                            :style="getAnswerStyle(answer)">
                      <q-card-section class="q-py-sm">
                        <div class="text-subtitle1 text-center text-weight-medium">
                          {{ roleTitles[answer as RoleTitleKey] }}
                        </div>
                      </q-card-section>

                      <q-card-section class="response-list">
                        <div v-for="response in filteredResponses(answer, [...role.filterRoles])"
                             :key="response.id"
                             class="response-item q-mb-sm">
                          <div v-if="!response.assigned && response.adminCentre.includes(exam.adminCentre)"
                               :class="['name-wrapper', 'q-pa-sm', 'rounded-borders']">
                            <div class="row items-center justify-between">
                              <div class="col">
                                <div class="text-subtitle2 text-weight-medium">
                                  <span class="clickable-name"
                                        @click="goToUserProfile(response.userId)">
                                    {{ response.userName }}
                                  </span>
                                </div>
                                <div class="text-caption q-mt-xs">{{ response.userNote }}</div>
                              </div>
                              <div class="col-auto">
                                <q-btn v-if="!response.assigned && (isOverrideActive || response.response !== 'No')"
                                      @click="addToExam(exam.id, response.userId, isOverrideActive, response.dayOfExamsId, role.title)"
                                      icon="add"
                                      round
                                      color="primary"
                                      size="xs"
                                      :disable="isExamLocked"
                                      class="q-ml-sm"/>
                              </div>
                            </div>
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

    <!-- Note Dialog -->
    <q-dialog v-model="showNoteDialog">
      <q-card class="note-dialog-card">
        <q-card-section>
          <div class="text-subtitle1 text-weight-medium">Full Note</div>
          <q-separator class="q-my-sm"/>
          <div class="note-content">{{ exam?.note }}</div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="primary" label="Close" v-close-popup size="md"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
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
import { CentreEnum } from 'src/db/types';

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
const scheduleUrl = ref('');

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
      message: 'Invalid file',
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
      return { backgroundColor: '#D2EFD2' }; // Light Green
    case 'AM':
      return { backgroundColor: '#FFFFCD' }; // Light Yellow
    case 'PM':
      return { backgroundColor: '#e3f2fd' }; // Light Blue
    case 'No':
      return { backgroundColor: '#ffebee' }; // Light Red
    default:
      return {};
  }
};

const getRoleIcon = (key: string) => {
  switch (key) {
    case 'supervisors':
      return 'supervisor_account';
    case 'invigilators':
      return 'remove_red_eye';
    case 'examiners':
      return 'school';
    default:
      return 'person';
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
    message: 'You want to inform all workers about this exam? You won\'t be able to edit the exam if it\'s prepared.',
    ok: {
      label: 'Inform',
      color: 'positive',
    },
    cancel: {
      label: 'Go back',
      color: 'negative',
    },
  }).onOk(async () => {
    if(!editableExam.value?.schedule && !editableExam.value?.isPrepared) {
      Dialog.create({
        title: 'No Schedule',
        message: 'You need to input schedule before preparing the exam.',
        ok: {
          label: 'OK',
          color: 'warning',
        },
      });
    }
    else if(!editableExam.value?.supervisors || !editableExam.value?.invigilators || !editableExam.value?.examiners) {
      Dialog.create({
        title: 'No Workers',
        message: 'You need to assign workers before preparing the exam.',
        ok: {
          label: 'OK',
          color: 'warning',
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
        label: 'Unprepare',
        color: 'positive',
      },
      cancel: {
        label: 'Go back',
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
      label: 'Delete',
      color: 'positive',
    },
    cancel: {
      label: 'Go back',
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
      label: 'Delete',
      color: 'positive',
    },
    cancel: {
      label: 'Go back',
      color: 'negative',
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

const saveScheduleUrl = async () => {
  if (!scheduleUrl.value || !editableExam.value) return;

  try {
    // Validate URL
    const url = new URL(scheduleUrl.value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new Error('Invalid URL protocol');
    }

    editableExam.value = {
      ...editableExam.value,
      schedule: scheduleUrl.value
    };

    await examStore.updateExam(editableExam.value);
    await examStore.getExam(editableExam.value.id);
    initializeEditableExam();

    scheduleUrl.value = ''; // Clear the input
  } catch (error) {
    console.error(error);
  }
};

const removeSchedule = async () => {
  if (!editableExam.value || isExamLocked.value) return;

  try {
    editableExam.value = {
      ...editableExam.value,
      schedule: undefined
    };

    await examStore.updateExam(editableExam.value);
    await examStore.getExam(editableExam.value.id);
    initializeEditableExam();

  } catch (error) {
    console.error(error);
  }
};
</script>
<style lang="scss" scoped>
.schedule-section {
  .schedule-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid rgba(0, 0, 0, 0.12);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }

  .schedule-button {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: darken($primary, 10%);
    }
  }
}

.container {
  display: flex;
  flex-direction: column;
  max-width: 100rem;
  margin: 0 auto;
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
  padding: 0.75rem;
  border-radius: 0.25rem;

  &.answer-yes {
    background-color: rgba(76, 175, 80, 0.1);
    border-left: 0.25rem solid #4CAF50;
  }

  &.answer-am {
    background-color: rgba(255, 235, 59, 0.1);
    border-left: 0.25rem solid #FFEB3B;
  }

  &.answer-pm {
    background-color: rgba(33, 150, 243, 0.1);
    border-left: 0.25rem solid #2196F3;
  }

  &.answer-no {
    background-color: rgba(244, 67, 54, 0.1);
    border-left: 0.25rem solid #F44336;
  }
}

.clickable-name {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
}

@media (min-width: 37.5rem) {
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

.exam-card {
  transition: all 0.3s ease;
  border-left: 0.3125rem solid $grey-5;

  &.is-prepared {
    border-left-color: $positive;
  }
}

.file-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  max-width: 15rem;
  background-color: rgba(0, 0, 0, 0.03);
  margin-bottom: 0.5rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: $grey-2;
  }
}

.file-name {
  flex-grow: 1;
  margin-right: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exam-detail-container {
  max-width: 100rem;
  margin: 0 auto;
  padding: 0 1rem;
}

.exam-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  margin-bottom: 1rem;
}

.border {
  border: 0.09375rem solid #adadad;
  border-radius: 0.25rem;
}

.exam-info-card, .staff-assignment-card {
  height: 100%;
  width: 100%;
}

.exam-info-card {
  border-left: 0.3125rem solid $grey-5;
  transition: all 0.3s ease;

  &.exam-ready {
    border-left-color: $positive;
  }
}

.response-item {
  transition: background-color 0.2s ease;
  margin-bottom: 0.5rem;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.response-list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.response-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.1);
  }
}

@media (max-width: 64rem) {
  .exam-navigation {
    flex-direction: column;
    align-items: stretch;
  }

  .exam-counter {
    order: -1;
    text-align: center;
    margin-bottom: 0.5rem;
  }
}

.exam-detail-container {
  max-width: 100rem;
  margin: 0 auto;
}

.container {
  display: flex;
  flex-direction: column;
  max-width: 100rem;
  margin: 0 auto;
  gap: 1rem;

  @media (min-width: 37.5rem) {
    flex-direction: row;
  }
}

.exam-card {
  transition: all 0.3s ease;
  border-left: 5px solid $grey-5;
  flex: 1;

  &.is-prepared {
    border-left-color: $positive;
  }

  &.is-completed {
    border-left-color: $warning;
  }
}

.override-section {
  flex: 2;
}

.exam-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 8px 16px;

  @media (max-width: 64rem) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
}

.status-badge {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;

  &.ready-badge {
    background-color: rgba(200, 230, 201, 0.2);
  }

  &.complete-badge {
    background-color: rgba(255, 215, 0, 0.1);
  }
}

.personnel-section {
  .personnel-card {
    background-color: #f8f9fa;
    border-radius: 4px;
    transition: all 0.2s ease;
    border: 1px solid transparent;

    &:hover {
      background-color: #f1f3f5;
      border-color: #e9ecef;
    }
  }
}

.schedule-card {
  background-color: #f8f9fa;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f3f5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}

.file-card {
  background-color: #f8f9fa;
  border-radius: 4px;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background-color: #f1f3f5;
    border-color: #e9ecef;
  }

  .file-name {
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.response-card {
  height: 100%;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .name-wrapper {
    border: 2px solid #cfcfcf;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f1f3f5;
      transform: translateY(-1px);
    }
  }
}

.clickable-name {
  cursor: pointer;
  &:hover {
    text-decoration: underline;
    color: $primary;
  }
}

.break-word {
  margin-top: 16px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
