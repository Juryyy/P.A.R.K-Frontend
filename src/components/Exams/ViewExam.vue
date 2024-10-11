<template>
  <div class="container q-mb-md">
    <q-card bordered :class="cardClass" v-if="editableExam">
      <q-card-section>
        <b
          v-if="editableExam.isPrepared && !editableExam.isCompleted"
          class="text-green text-bold text-h5"
          >This exam is marked as ready!</b
        >
        <b
          v-else-if="editableExam.isCompleted"
          class="text-orange text-bold text-h5"
          >This exam is completed!</b
        >

        <div>
          <div class="text-h5">{{ exam.type }}</div>
          <div class="text-h5">{{ exam.location }} - {{ exam.venue }}</div>
          <div class="text-bold">
            Levels:
            <q-chip
              v-for="level in exam.levels"
              :key="level"
              :color="getLevelColor(level)"
              class="q-ma-xs"
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

        <q-separator class="q-my-sm" />
        <div v-for="(role, key) in roles" :key="key">
          {{ role.title }}:
          <div v-if="editableExam[key].length === 0">No {{ key }} assigned</div>
          <div
            class="text-bold personnel-item"
            v-else
            v-for="person in editableExam[key]"
            :key="person.id"
          >
            {{ person.firstName }} {{ person.lastName }}
            <q-btn
              v-if="
                isCurrentUser(person.id) &&
                exam.isPrepared &&
                !exam.isCompleted
              "
              flat
              round
              dense
              :icon="getConfirmationIcon(person.id, key)"
              :color="getConfirmationColor(person.id, key)"
              @click="toggleConfirmation(person.id, key)"
              :loading="isLoading(person.id, key)"
              class="q-ml-sm"
            >
              <q-tooltip>
                {{ getConfirmationTooltip(person.id, key) }}
              </q-tooltip>
            </q-btn>
            <q-icon
              v-if="
                currentUser.role &&
                currentUser.role.includes('Office') &&
                !isCurrentUser(person.id) &&
                exam.isPrepared &&
                !exam.isCompleted
              "
              :name="getConfirmationIcon(person.id, key)"
              :color="getConfirmationColor(person.id, key)"
              size="sm"
              class="q-ml-sm"
            >
              <q-tooltip>
                {{ getConfirmationTooltip(person.id, key) }}
              </q-tooltip>
            </q-icon>
          </div>
        </div>
        <q-separator class="q-mt-sm" />

        <p class="text-h6 q-mt-sm">Files:</p>
        <div v-if="exam.files && exam.files.length > 0">
          <div
            v-for="file in exam.files"
            :key="file.id"
            class="q-mt-sm file-item"
          >
            <q-icon
              :name="getFileIcon(file.name)"
              size="24px"
              class="q-mr-sm"
            />
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
          </div>
        </div>

        <q-separator class="q-my-sm" />
        <p v-if="editableExam.dayReport" class="text-h6 q-mt-sm">
          Exam Day Report:
        </p>
        <div v-if="editableExam.dayReport" class="file-item">
          <q-icon name="picture_as_pdf" size="24px" class="q-mr-sm" />
          <span class="file-name">{{ editableExam.dayReport.name }}</span>
          <q-btn
            flat
            dense
            round
            icon="download"
            @click="downloadExamDayReport()"
            :loading="loadingFiles[editableExam.dayReport.id] ?? false"
          >
            <template v-slot:loading>
              <q-spinner size="20px" />
            </template>
          </q-btn>
          <q-btn flat dense round color="negative" icon="delete" />
          <!--            @click=/* deleteFile(editableExam.dayReport.id, editableExam.dayReport.name) */
-->
        </div>
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

const examStore = useExamStore();

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
  supervisors: { title: 'Supervisor' },
  invigilators: {
    title: 'Invigilator',
  },
  examiners: { title: 'Examiner' },
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
  console.log(editableExam.value);
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
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.top-card {
  width: 90%;
  margin-bottom: 3rem;
}

.form-card {
  width: 90%;
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
  border: 3px solid #cbe09d;
}

.complete-border {
  border: 3px solid #ffd700;
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
</style>
