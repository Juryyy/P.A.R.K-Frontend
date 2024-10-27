<template>
  <div class="profile-container q-pa-md">
    <q-card class="profile-card" v-if="editableUser">
      <q-banner v-if="editableUser.deactivated" class="text-white bg-red-6">
        This account has been deactivated!
      </q-banner>

      <q-card-section class="profile-header">
        <div class="avatar-container">
          <q-avatar size="160px" class="shadow-3">
            <q-img :src="avatarPreview ?? userAvatar ?? ''" v-if="avatarPreview || userAvatar">
              <template v-slot:error>
                <div class="text-subtitle1 text-weight-bold">{{ getInitials(editableUser) }}</div>
              </template>
            </q-img>
            <div v-else class="text-subtitle1 text-weight-bold">{{ getInitials(editableUser) }}</div>
          </q-avatar>
          <div class="avatar-overlay" v-if="isCurrentUser">
            <q-btn round color="grey-7" icon="camera_alt" size="sm" @click="triggerFileUpload">
              <q-tooltip>Upload new avatar</q-tooltip>
            </q-btn>
          </div>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            style="display: none"
            @change="onAvatarSelected"
          >
        </div>
        <div class="profile-name q-mt-sm">
          <div class="text-h5 text-weight-bold">{{ editableUser.firstName }} {{ editableUser.lastName }}</div>
          <div class="text-subtitle1">{{ editableUser.email }}</div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-col-gutter-md">
          <template v-if="isCurrentUser">
            <!-- Editable User Info Section -->
            <div class="col-12">
              <div class="text-h6">User Information</div>
            </div>
            <div class="col-12 col-sm-6" v-for="field in userInfoFields" :key="field.label">
              <q-input
                :model-value="editableFields[field.key]"
                @update:model-value="(value) => updateField(field.key, value)"
                :label="field.label"
                :type="field.key === 'dateOfBirth' ? 'text' : field.type"
                :mask="field.key === 'dateOfBirth' ? '####-##-##' : undefined"
                outlined
                dense
                stack-label
              >
                <template v-if="field.key === 'dateOfBirth'" v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="editableFields[field.key]" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-6" style="display: flex; align-items: center;">
              <q-checkbox
                v-model="editableUser.drivingLicense"
                label="Driving License"
                stack-label
              />
            </div>

            <!-- Editable Availability Section -->
            <div class="col-12 q-mt-md">
              <div class="text-h6 q-mb-sm">Availability</div>
            </div>
            <div class="col-12" v-for="field in availabilityFields" :key="field.label">
              <q-input
                :model-value="editableFields[field.key]"
                @update:model-value="(value) => updateField(field.key, value)"
                :label="field.label"
                :type="field.type"
                outlined
                dense
                stack-label
              />
            </div>

            <!--Exam Administration Section -->
            <div class="col-12">
              <div class="row items-center q-mb-sm">
                <div class="text-body1 q-mr-md">Totara Training Status:</div>
                <q-toggle
                  v-model="editableUser.totaraDone"
                  color="green"
                  :label="editableUser.totaraDone ? 'Completed' : 'Not Completed'"
                />
              </div>
              <q-input
                v-model="editableFields.totaraDate"
                label="Completion Date"
                outlined
                dense
                stack-label
                :disable="!editableUser.totaraDone"
                mask="####-##-##"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date
                        v-model="editableFields.totaraDate"
                        mask="YYYY-MM-DD"
                        :disable="!editableUser.totaraDone"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </template>


          <template v-else>
            <!-- View Only User Info Section -->
            <div class="col-12">
              <div class="text-h6 q-mb-sm">User Information</div>
            </div>
            <div class="col-12 col-sm-6" v-for="field in userInfoFields" :key="field.label">
              <div class="text-subtitle2">{{ field.label }}</div>
              <div class="text-body1 q-mb-sm">{{ formatFieldValue(editableUser[field.key], field.type) }}</div>
            </div>
            <div class="col-12 col-sm-6">
              <div class="text-subtitle2">Driving License</div>
              <q-checkbox v-model="editableUser.drivingLicense" disable />
            </div>

            <!-- View Only Availability Section -->
            <div class="col-12 q-mt-md">
              <div class="text-h6 q-mb-sm">Availability</div>
            </div>
            <div class="col-12" v-for="field in availabilityFields" :key="field.label">
              <div class="text-subtitle2">{{ field.label }}</div>
              <div class="text-body1 q-mb-sm">{{ formatFieldValue(editableUser[field.key], field.type) }}</div>
            </div>
          </template>
        </div>

        <q-input
          v-if="isCurrentUserAdmin"
          v-model="editableUser.adminNote"
          label="Admin Note"
          type="textarea"
          outlined
          class="q-mt-md"
          stack-label
        />

        <div class="q-mt-md">
          <div class="text-subtitle1 q-mb-sm">Roles:</div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="role in editableUser.role"
              :key="role"
              :color="getRoleColor(role)"
              text-color="black"
              size="md"
            >
              {{ role }}
            </q-chip>
          </div>
        </div>

        <div v-if="editableUser.level" class="q-mt-md">
          <div class="text-subtitle1 q-mb-sm">Levels:</div>
          <div class="row q-gutter-xs">
            <q-chip
              v-for="level in editableUser.level"
              :key="level"
              :color="getLevelColor(level)"
              text-color="black"
              size="md"
            >
              {{ level }}
            </q-chip>
          </div>
        </div>

        <div v-if="showExamCounts" class="q-mt-md">
          <div class="text-subtitle1 q-mb-sm">Exam Counts:</div>
          <div v-if="editableUser._count?.supervisedExams !== undefined" class="text-body1">
            Supervised Exams: {{ editableUser._count.supervisedExams }}
          </div>
          <div v-if="editableUser._count?.invigilatedExams !== undefined" class="text-body1">
            Invigilated Exams: {{ editableUser._count.invigilatedExams }}
          </div>
          <div v-if="editableUser._count?.examinedExams !== undefined" class="text-body1">
            Examined Exams: {{ editableUser._count.examinedExams }}
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn v-if="isCurrentUser" :disable="!hasChanges || isUpdating" color="primary" @click="updateProfile">
          <q-spinner v-if="isUpdating" color="white" size="1em" />
          <span v-else>Update Profile</span>
        </q-btn>
        <q-btn v-if="isCurrentUserAdmin" :disable="!hasChanges || isUpdating" color="secondary" @click="updateAdminNote">
          <q-spinner v-if="isUpdating" color="white" size="1em" />
          <span v-else>Update Admin Note</span>
        </q-btn>
      </q-card-actions>
    </q-card>
    <div v-else class="text-h6 text-center">No user information available.</div>
    <q-dialog v-model="showCropper" persistent>
      <q-card style="min-width: 300px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Crop Avatar</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="cancelAvatarUpload" />
        </q-card-section>

        <q-card-section>
          <Cropper
            v-if="imageUrl"
            class="cropper"
            :src="imageUrl"
            :stencil-props="{
              aspectRatio: 1
            }"
            :stencil-component="CircleStencil"
            ref="cropperRef"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" v-close-popup @click="cancelAvatarUpload" />
          <q-btn flat label="Crop & Upload" color="primary" @click="cropAndUpload" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue';
import { RoleEnum, User} from 'src/db/types';
import { defineProps } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { getRoleColor, getLevelColor } from 'src/helpers/Color';
import { formatDateString } from 'src/helpers/FormatTime';
import deepEqual from 'src/helpers/deepEqual';
import { parseISO, format } from 'date-fns';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

const props = defineProps<{
  user: User | null;
  userAvatar: string | null;
}>();

const userStore = useUserStore();

type EditableFieldKey = 'firstName' | 'lastName' | 'email' | 'dateOfBirth' | 'phone' | 'note' | 'noteLonger' | 'totaraDate';

type EditableFields = {
  [K in EditableFieldKey]: string;
};

interface EditableUserField {
  key: EditableFieldKey;
  label: string;
  type: 'text' | 'date' | 'email' | 'tel' | 'textarea';
}

const userInfoFields: EditableUserField[] = [
  { key: 'firstName', label: 'First Name', type: 'text' },
  { key: 'lastName', label: 'Last Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { key: 'phone', label: 'Phone', type: 'tel' },
];


const availabilityFields: EditableUserField[] = [
  { key: 'note', label: 'Short Note (optional) - ex. "No fridays" ', type: 'text' },
  { key: 'noteLonger', label: 'Detailed Note (optional) - Please give us more detailed information about your availability', type: 'textarea' },
];

const editableUser = ref<User | null>(props.user ? { ...props.user } : null);
const initialUser = ref<User | null>(props.user ? { ...props.user } : null);

const editableFields = reactive<EditableFields>({
  firstName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  phone: '',
  note: '',
  noteLonger: '',
  totaraDate: '',
});

const updateEditableFields = () => {
  if (editableUser.value) {
    [...userInfoFields, ...availabilityFields].forEach((field) => {
      const key = field.key;
      if (key === 'dateOfBirth' && editableUser.value?.[key]) {
        const date = parseISO(editableUser.value[key] as string);
        editableFields[key] = format(date, 'yyyy-MM-dd');
      } else {
        editableFields[key] = (editableUser.value?.[key] as string) ?? '';
      }
    });
  }
};

watch(() => props.user, (newUser) => {
  editableUser.value = newUser ? { ...newUser } : null;
  initialUser.value = newUser ? { ...newUser } : null;
  updateEditableFields();
}, { immediate: true });

const updateField = (key: EditableFieldKey, value: string | number | null) => {
  if (value !== null) {
    if (key === 'dateOfBirth') {
      const date = parseISO(value as string);
      editableFields[key] = format(date, 'yyyy-MM-dd');
      if (editableUser.value) {
        editableUser.value[key] = format(date, 'yyyy-MM-dd');
      }
    } else {
      editableFields[key] = String(value);
      if (editableUser.value) {
        editableUser.value[key] = String(value);
      }
    }
  } else {
    editableFields[key] = '';
    if (editableUser.value) {
      editableUser.value[key] = '';
    }
  }
};

const currentUser = userStore.user;

const isCurrentUser = computed(() => currentUser?.id === editableUser.value?.id);

const isCurrentUserAdmin = computed(() => {
  if (!currentUser.role) return false;
  return currentUser?.role.includes(RoleEnum.Office) || currentUser?.role.includes(RoleEnum.Developer);
});

const hasChanges = computed(() => !deepEqual(editableUser.value, initialUser.value));

const isUpdating = ref(false);

watch(() => props.user, (newUser) => {
  editableUser.value = newUser ? { ...newUser } : null;
  initialUser.value = newUser ? { ...newUser } : null;
});

const showExamCounts = computed(() => {
  return editableUser.value && editableUser.value._count && (
    editableUser.value._count.supervisedExams !== undefined ||
    editableUser.value._count.invigilatedExams !== undefined ||
    editableUser.value._count.examinedExams !== undefined
  );
});

const getInitials = (user: User) => {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
};

const formatFieldValue = (value: any, type: string | undefined) => {
  if (type === 'date' && value) {
    return formatDateString(value);
  }
  return value || '---';
};

const updateProfile = async () => {
  if (!editableUser.value) return;

  isUpdating.value = true;
  try {
    await userStore.updateProfile(
      editableUser.value.id,
      editableFields.email,
      editableFields.firstName,
      editableFields.lastName,
      editableFields.dateOfBirth,
      editableFields.note,
      editableFields.noteLonger,
      editableUser.value.drivingLicense,
      editableFields.phone,
      editableFields.totaraDate,
      editableUser.value.totaraDone
    );

    await userStore.getProfile(editableUser.value.id);
    if (userStore.selectedUser) {
      editableUser.value = { ...userStore.selectedUser };
      initialUser.value = { ...userStore.selectedUser };
      updateEditableFields();
    }
  } finally {
    isUpdating.value = false;
  }
};

const updateAdminNote = async () => {
  if (!editableUser.value) return;

  isUpdating.value = true;
  try {
    await userStore.updateAdminNote(
      editableUser.value.id,
      editableUser.value.adminNote
    );

    await userStore.getProfile(editableUser.value.id);
    if (userStore.selectedUser) {
      editableUser.value = { ...userStore.selectedUser };
      initialUser.value = { ...userStore.selectedUser };
    }
  } finally {
    isUpdating.value = false;
  }
};

const avatarFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);
const showCropper = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const cropperRef = ref<InstanceType<typeof Cropper> | null>(null);
const imageUrl = ref<string | null>(null);

const triggerFileUpload = () => {
  fileInput.value?.click();
};

const cancelAvatarUpload = () => {
  avatarFile.value = null;
  avatarPreview.value = null;
  imageUrl.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  showCropper.value = false;
};

const cropAndUpload = async () => {
  if (cropperRef.value) {
    const { canvas } = cropperRef.value.getResult();
    if (canvas) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          const croppedFile = new File([blob], avatarFile.value?.name || 'avatar.jpg', { type: 'image/jpeg' });
          avatarPreview.value = URL.createObjectURL(blob);

          if (editableUser.value) {
            try {
              await userStore.uploadAvatar(croppedFile);
              await userStore.getProfile(editableUser.value.id);
              await userStore.getUserAvatarById(editableUser.value.id);
            } catch (error) {
              console.error('Error uploading avatar:', error);
            }
          }

          showCropper.value = false;
        }
      }, 'image/jpeg');
    }
  }
};


const onAvatarSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    avatarFile.value = file;
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (typeof e.target?.result === 'string') {
        imageUrl.value = e.target.result;
        showCropper.value = true;
      }
    };
    reader.readAsDataURL(file);
  }
};


</script>

<style lang="scss" scoped>
.profile-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.profile-card {
  width: 100%;
  max-width: 600px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  background-color: #f0f0f0;
}

.profile-name {
  text-align: center;
}

@media (max-width: 599px) {
  .profile-card {
    max-width: 100%;
    margin: 0 16px;
  }
}

.q-checkbox {
  margin-left: -10px;
}

.q-chip {
  font-weight: 600;
}
</style>
