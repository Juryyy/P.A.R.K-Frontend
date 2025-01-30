<template>
  <div class="container q-mb-md">
    <q-card bordered :class="cardClass" v-if="editableExam">
      <q-card-section>
        <!-- Status Badges -->
        <div v-if="editableExam.isPrepared && !editableExam.isCompleted"
             class="status-badge ready-badge q-mb-sm">
          <q-icon name="check_circle" color="green" size="sm" class="q-mr-xs"/>
          <div>
          <b class="text-green text-bold text-subtitle1">This exam is marked as ready!</b>
          </div>
          <b class="text-green text-bold text-subtitle1">Make sure to confirm your attendance </b>
        </div>
        <div v-else-if="editableExam.isCompleted"
             class="status-badge complete-badge q-mb-sm">
          <q-icon name="event_available" color="orange" size="sm" class="q-mr-xs"/>
          <b class="text-orange text-bold text-subtitle1">This exam is completed!</b>
        </div>

        <!-- Main Exam Info -->
        <div class="exam-info q-mb-md">
          <div class="text-h6 text-weight-bold">{{ exam.type }}</div>
          <div class="location-info q-mt-xs">
            <q-icon name="location_on" color="grey-7" size="sm" class="q-mr-xs"/>
            <span class="text-subtitle2 text-grey-8">{{ exam.location }} - {{ exam.venue }}</span>
          </div>
        </div>

        <!-- Levels -->
        <div class="levels-section q-mb-md">
          <div class="row items-center q-mb-xs">
            <q-icon name="school" color="primary" size="sm" class="q-mr-xs"/>
            <span class="text-subtitle2 text-weight-medium">Levels:</span>
          </div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="level in exam.levels"
              :key="level"
              :color="getLevelColor(level)"
              text-color="white"
              class="level-chip"
              dense
              size="md"
            >
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

        <!-- Note Section -->
        <div class="note-section bg-blue-1 q-pa-sm rounded-borders q-mb-md" v-if="exam.note">
          <div class="row items-start">
            <q-icon name="notes" color="primary" size="sm" class="q-mr-xs q-mt-xs"/>
            <div class="column">
              <div class="text-caption text-grey-8">Note:</div>
              <div class="text-subtitle2 text-weight-medium">
                <!--<span v-if="shouldShowMoreLink(exam.note)"
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

        <!-- Personnel Section -->
        <q-separator class="q-my-md" />
        <div v-for="(role, key) in roles" :key="key" class="personnel-section q-mb-md">
          <div class="row items-center q-mb-xs">
            <q-icon :name="getRoleIcon(key)" color="primary" size="sm" class="q-mr-xs"/>
            <span class="text-subtitle2 text-weight-medium">{{ role.title }}:</span>
          </div>

          <div v-if="editableExam[key].length === 0"
               class="empty-state q-pa-xs bg-grey-2 rounded-borders text-grey-7 text-caption">
            No {{ key }} assigned
          </div>

          <div v-else class="personnel-cards">
            <div v-for="person in editableExam[key]"
                 :key="person.id"
                 class="personnel-card q-pa-xs q-mb-xs">
              <div class="row items-center justify-between">
                <div class="row items-center">
                  <span class="q-ml-xs text-subtitle2">
                    {{ person.firstName }} {{ person.lastName }}
                  </span>
                </div>

                <div class="row items-center">
                  <!-- Confirmation button for current user -->
                  <q-btn v-if="isCurrentUser(person.id) && exam.isPrepared && !exam.isCompleted"
                         flat
                         round
                         dense
                         size="md"
                         :icon="getConfirmationIcon(person.id, key)"
                         :color="getConfirmationColor(person.id, key)"
                         @click="toggleConfirmation(person.id, key)"
                         :loading="isLoading(person.id, key)"
                         class="confirmation-btn q-mr-xs">
                    <q-tooltip>{{ getConfirmationTooltip(person.id, key) }}</q-tooltip>
                  </q-btn>

                  <!-- Substitute request -->
                  <q-btn v-if="isCurrentUser(person.id) && exam.isPrepared && !exam.isCompleted"
                         round
                         flat
                         dense
                         size="md"
                         icon="swap_horizontal_circle"
                         color="warning"
                         @click="requestSubstitute(editableExam.id, person.id, roleKeyToEnum(key))"
                         class="q-ml-xs">
                    <q-tooltip class="bg-warning text-black" >Request a substitution for you</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Schedule Section -->
        <q-separator class="q-my-md" />
        <div class="schedule-section q-mb-md">
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
                <q-btn :href="editableExam.schedule"
                       target="_blank"
                       rel="noopener noreferrer"
                       color="primary"
                       size="md"
                       class="schedule-button"
                       icon-right="open_in_new"
                       no-caps>
                  Open Schedule
                </q-btn>
              </q-card-section>
            </q-card-section>
          </q-card>
        </div>

        <!-- Files Section -->
        <template v-if="exam.files && exam.files.length > 0">
          <q-separator class="q-my-md" />
          <div class="files-section">
            <div class="row items-center q-mb-sm">
              <q-icon name="attachment" color="primary" size="sm" class="q-mr-xs"/>
              <span class="text-subtitle1">Files</span>
            </div>

            <div class="file-cards">
              <div v-for="file in exam.files"
                   :key="file.id"
                   class="file-card q-mb-xs">
                <div class="row items-center justify-between q-pa-xs">
                  <div class="row items-center">
                    <q-icon :name="getFileIcon(file.name)"
                           size="18px"
                           class="q-mr-xs text-primary"/>
                    <span class="file-name text-subtitle2">{{ file.name }}</span>
                  </div>

                  <q-btn flat
                         dense
                         round
                         size="md"
                         icon="download"
                         color="primary"
                         @click="downloadFile(file.id ?? 0, file.name)"
                         :loading="file.id !== undefined ? loadingFiles[file.id] : false">
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Day Report Section -->
        <template v-if="editableExam.dayReport">
          <q-separator class="q-my-md" />
          <div class="day-report-section">
            <div class="row items-center q-mb-sm">
              <q-icon name="description" color="primary" size="sm" class="q-mr-xs"/>
              <span class="text-subtitle1">Exam Day Report</span>
            </div>

            <div class="file-card">
              <div class="row items-center justify-between q-pa-xs">
                <div class="row items-center">
                  <q-icon name="picture_as_pdf"
                         size="18px"
                         class="q-mr-xs text-red"/>
                  <span class="file-name text-subtitle2">
                    {{ editableExam.dayReport.name }}
                  </span>
                </div>

                <div class="row items-center">
                  <q-btn flat
                         dense
                         round
                         size="md"
                         icon="download"
                         color="primary"
                         @click="downloadExamDayReport()"
                         :loading="loadingFiles[editableExam.dayReport.id] ?? false"
                         class="q-mr-xs"/>
                  <q-btn flat
                         dense
                         round
                         size="md"
                         color="negative"
                         icon="delete"/>
                </div>
              </div>
            </div>
          </div>
        </template>
      </q-card-section>
    </q-card>

    <q-card
      bordered
      class="q-ma-md form-card"
      v-if="editableExam && editableExam.dayReport === null"
    >
      <q-card-section>
        <b class="text-h5">Exam day report:</b>
        <q-form class="q-my-md" ref="examForm">
          <q-input
            v-model="editableExam.type"
            label="Type"
            outlined
            dense
            readonly
            :input-style="{ fontWeight: 'bold' }"
            class="q-mb-md"
          />
          <q-input
            v-model="location"
            label="Location"
            outlined
            dense
            readonly
            :input-style="{ fontWeight: 'bold' }"
            class="q-mb-md"
          />
          <q-input
            v-model="levels"
            label="Levels"
            outlined
            dense
            readonly
            :input-style="{ fontWeight: 'bold' }"
            class="q-mb-md"
          />
          <q-input
            v-model="candidates"
            label="Number of candidates"
            outlined
            dense
            type="number"
            :rules="[(val) => !!val || 'Number of candidates is required']"
            :input-style="{ fontWeight: 'bold' }"
          />

          <q-input
            v-model.number="absent"
            label="Number of absent candidates"
            outlined
            dense
            type="number"
            :rules="[
              (val) => !!val || 'Number of absent candidates is required',
            ]"
            :input-style="{ fontWeight: 'bold' }"
          />

          <div v-if="absent && absent > 0" class="q-mb-md q-pa-sm table-border">
            <p class="text-subtitle1">Absent Candidates Details:</p>
            <div
              class="row q-col-gutter-xs q-mb-sm q-mx-xs q-px-sm table-header"
            >
              <div class="col-2">ID</div>
              <div class="col-3">First Name</div>
              <div class="col-4">Last Name</div>
              <div class="col-3">Level</div>
            </div>
            <div
              v-for="(candidate, index) in absentCandidates"
              :key="index"
              class="row q-col-gutter-xs q-mb-sm table-row"
            >
              <div class="col-2">
                <q-input v-model="candidate.id" dense outlined />
              </div>
              <div class="col-3">
                <q-input v-model="candidate.firstName" dense outlined />
              </div>
              <div class="col-4">
                <q-input v-model="candidate.lastName" dense outlined />
              </div>
              <div class="col-3">
                <q-select
                  v-model="candidate.level"
                  :options="editableExam.levels"
                  dense
                  outlined
                  emit-value
                  map-options
                />
              </div>
            </div>
          </div>

          <q-input
            v-model="issues"
            label="Issues"
            outlined
            dense
            type="textarea"
            :rules="[(val) => !!val || 'Issues are required']"
          />
          <q-input
            v-model="comment"
            label="Comment"
            outlined
            dense
            type="textarea"
            :rules="[(val) => !!val || 'Comment is required']"
          />
          <q-btn
            color="primary"
            icon="save"
            @click="saveExamDayReport"
            class="q-mb-md float-right"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useExamStore } from 'src/stores/examStore';
import { QForm } from 'quasar';
import { AbsentCandidates, Exam } from 'src/db/types';
import { formatTimeString } from 'src/helpers/FormatTime';
import { getLevelColor } from 'src/helpers/Color';
import { getFileIcon } from 'src/helpers/FileType';
import { RoleEnum } from 'src/db/types';
import { useUserStore } from 'src/stores/userStore';
import { useQuasar } from 'quasar';

const examStore = useExamStore();
const $q = useQuasar();

const props = defineProps<{
  exam: Exam;
}>();

const editableExam = ref<Exam | null>(props.exam ? { ...props.exam } : null);

const candidates = ref<number>();
const comment = ref<string>();
const issues = ref<string>();
const absent = ref<number>();
const examForm = ref<QForm | null>(null);

const userStore = useUserStore();
const currentUser = computed(() => userStore.user);

const levels = computed(() => {
  return editableExam.value?.levels.join(', ');
});

const location = computed(() => {
  return editableExam.value?.location + ' - ' + editableExam.value?.venue;
});

const absentCandidates = ref<AbsentCandidates[]>([]);

watch(
  () => absent.value,
  (newCount) => {
    if (newCount && newCount > 0) {
      absentCandidates.value = Array(Number(newCount))
        .fill(null)
        .map(() => ({ id: undefined, firstName: '', lastName: '', level: '' }));
    } else {
      absentCandidates.value = [];
    }
  },
  { immediate: true, deep: true }
);

const initializeEditableExam = () => {
  if (props.exam) {
    const formattedExam = {
      ...props.exam,
      startTime: formatTimeString(props.exam.startTime),
      endTime: formatTimeString(props.exam.endTime),
    };
    editableExam.value = formattedExam;
  }
};

initializeEditableExam();

const loadingFiles = reactive<{ [key: number]: boolean }>({});
const showNoteDialog = ref(false);

const roles = {
  supervisors: { title: 'Supervisors' },
  invigilators: {
    title: 'Invigilators',
  },
  examiners: { title: 'Examiners' },
} as const;

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


const requestSubstitute = async (
  examId: number,
  userId: number,
  role: RoleEnum
) => {
  $q.dialog({
    title: 'Request Substitute',
    message: 'Are you sure you want to request a substitute? You will be removed from the exam, if substitution is found.',
    ok: {
      label: 'Request',
      color: 'primary',
    },
    cancel: {
      label: 'Cancel',
      color: 'negative',
    }
  }).onOk(() => {
  //await examStore.requestSubstitute(examId, userId, role);
  console.log('Requesting substitute for user:', userId, 'in exam:', examId, 'for role:', role);
  });
};

const saveExamDayReport = async () => {
  if (!editableExam.value) {
    return;
  }

  if (examForm.value) {
    const isFormValid = await examForm.value.validate();
    if (!isFormValid) {
      return;
    }
  }

  if (
    !candidates.value ||
    !comment.value ||
    !issues.value ||
    absent.value === undefined
  ) {
    return;
  }

  await examStore.uploadExamDayReport(
    editableExam.value.id,
    candidates.value,
    absent.value,
    comment.value,
    issues.value,
    absentCandidates.value
  );
};

const downloadFile = async (fileId: number, fileName: string) => {
  if (fileId === undefined) {
    console.error('Invalid fileId: cannot be undefined');
    return;
  }
  loadingFiles[fileId] = true;
  try {
    await examStore.downloadExamFile(fileId, fileName);
  } finally {
    loadingFiles[fileId] = false;
  }
};

const downloadExamDayReport = async () => {
  if (!editableExam.value) {
    console.error('Invalid editableExam: cannot be null or undefined');
    return;
  }

  if (
    editableExam.value.dayReport?.id === null ||
    editableExam.value.dayReport?.id === undefined
  ) {
    console.error('Invalid dayReportId: cannot be null or undefined');
    return;
  }

  loadingFiles[editableExam.value.dayReport.id] = true;
  try {
    await examStore.downloadExamDayReport(
      editableExam.value.dayReport.id,
      editableExam.value.dayReport?.name ?? ''
    );
  } finally {
    loadingFiles[editableExam.value.dayReport.id] = false;
  }
};

const cardClass = computed(() => {
  if (editableExam.value?.isPrepared && !editableExam.value?.isCompleted) {
    return 'positive-border top-card q-ma-md';
  } else if (editableExam.value?.isCompleted) {
    return 'complete-border top-card q-ma-md';
  } else {
    return 'top-card q-ma-md';
  }
});

const getConfirmationStatus = (userId: number, roleKey: string): boolean => {
  if (!editableExam.value || !editableExam.value.userConfirmations) {
    return false;
  }

  const roleEnum = roleKeyToEnum(roleKey);

  const confirmation = editableExam.value.userConfirmations.find(
    (conf) => conf.userId === userId && conf.role === roleEnum
  );

  return confirmation?.isConfirmed ?? false;
};

const isCurrentUser = (userId: number) => {
  return currentUser.value?.id === userId;
};

const loadingConfirmations = ref<{ [key: string]: boolean }>({});

const isLoading = (userId: number, roleKey: string) => {
  return loadingConfirmations.value[`${userId}-${roleKey}`] || false;
};

const getConfirmationIcon = (userId: number, roleKey: string) => {
  return getConfirmationStatus(userId, roleKey) ? 'check_circle' : 'cancel';
};

const getConfirmationColor = (userId: number, roleKey: string) => {
  return getConfirmationStatus(userId, roleKey) ? 'positive' : 'negative';
};

const getConfirmationTooltip = (userId: number, roleKey: string) => {
  return getConfirmationStatus(userId, roleKey)
    ? 'Confirmed. Click to cancel confirmation'
    : 'Not confirmed. Click to confirm';
};

const toggleConfirmation = async (userId: number, roleKey: string) => {
  if (!editableExam.value) return;

  const loadingKey = `${userId}-${roleKey}`;
  loadingConfirmations.value[loadingKey] = true;

  try {
    const currentStatus = getConfirmationStatus(userId, roleKey);
    const roleEnum = roleKeyToEnum(roleKey);
    await examStore.toggleExamConfirmation(
      editableExam.value.id,
      roleEnum,
      !currentStatus
    );

    await examStore.getExam(editableExam.value.id);
    await userStore.getUsersExams();

    if (examStore.selectedExam) {
      editableExam.value = examStore.selectedExam;
      initializeEditableExam();
    }
  } catch (error) {
    console.error('Failed to toggle confirmation:', error);
  } finally {
    loadingConfirmations.value[loadingKey] = false;
  }
};

const roleKeyToEnum = (key: string): RoleEnum => {
  switch (key.toLowerCase()) {
    case 'supervisors':
      return RoleEnum.Supervisor;
    case 'invigilators':
      return RoleEnum.Invigilator;
    case 'examiners':
      return RoleEnum.Examiner;
    default:
      throw new Error(`Invalid role key: ${key}`);
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

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  max-width: 100rem;
  margin: 0 auto;
  margin-bottom: 1rem;
}

.top-card {
  margin-bottom: 3rem;
  transition: all 0.3s ease;
  border-left: 5px solid #e0e0e0;
  max-width:max-content;
}

@media (min-width: 600px) {
  .container {
    flex-direction: row;
    align-items: flex-start;
  }

  .top-card {
    width: calc(50% - 0.5rem);
    margin-right: 1rem;
    margin-bottom: 0;
    align-self: flex-start;
  }

  .form-card {
    width: calc(50% - 0.5rem);
  }
}

.positive-border {
  border-left-color: $positive !important; // Green border for prepared
}

.complete-border {
  border-left: 5px solid #FFA000 !important; // Orange border for completed
}

.status-badge {
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

.exam-info {
  .location-info {
    display: flex;
    align-items: center;
  }
}

.time-details {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }
}

.level-chip {
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

.note-section {
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(33, 150, 243, 0.1);
  }
}

.table-border {
  border: 1px solid lightgrey;
  border-radius: 10px;
}

.table-header {
  font-weight: bold;
  background-color: #f7f7f7;
  border-radius: 5px;
}

.table-row:last-child {
  border-bottom: none;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  max-width: 15rem;
  background-color: rgba(0, 0, 0, 0.03);
  margin-bottom: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }
}

.file-name {
  flex-grow: 1;
  margin-right: 8px;
}

.personnel-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

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

.empty-state {
  border-radius: 8px;
  font-style: italic;
}

.break-word {
  margin-top: 16px;
  white-space: pre-wrap;
  word-break: break-word;
}

</style>
