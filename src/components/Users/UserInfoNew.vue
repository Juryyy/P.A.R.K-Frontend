<template>
  <div class="profile-container q-pa-md">
    <q-card class="profile-card" v-if="editableUser">
      <div class="status-banners">
        <q-banner v-if="editableUser.deactivated" class="text-white bg-red-6" rounded>
          <template v-slot:avatar>
            <q-icon name="warning" color="white" />
          </template>
          This account has been deactivated!
        </q-banner>

        <q-banner v-if="!editableUser.totaraDone && isCurrentUser" class="text-white bg-red-6" rounded>
          <template v-slot:avatar>
            <q-icon name="school" color="white" />
          </template>
          <b>Please complete the Totara training before you can attend exams.</b>
        </q-banner>
        <q-banner v-else-if="!editableUser.totaraDone && currentUser.role.includes(RoleEnum.Office)" class="text-white bg-red-6" >
          <template v-slot:avatar>
            <q-icon name="school" color="white" />
          </template>
          <b>This user has not completed the Totara training yet.</b>
        </q-banner>

        <q-banner v-if="!editableUser.activatedAccount"
                 :class="[currentUser ? 'bg-orange-6' : 'bg-red-6']"
                 class="text-white"
                 >
          <template v-slot:avatar>
            <q-icon name="person_outline" color="white" />
          </template>
          <div v-if="isCurrentUser&& !editableUser.activatedAccount">
            Please setup your profile to gain access to whole app by doing those steps:
            <ul class="q-mt-sm q-mb-none">
              <li v-if="!editableUser.phone">Filling your contact number</li>
              <li v-if="!editableUser.totaraDone">Update your Totara information</li>
              <li v-if="!editableUser.passwordUpdated">(Optional but recommended) Update your password</li>
              <li v-if="!editableUser.avatarUrl">(Optional) Update your avatar</li>
            </ul>
          </div>
          <div v-else-if="!editableUser.activatedAccount && currentUser.role.includes(RoleEnum.Office)">
            <b>This user has not activated their account yet.</b>
          </div>
        </q-banner>
      </div>

      <!-- Profile Header -->
      <div class="profile-header q-pa-lg text-center">
        <div class="avatar-container">
          <q-avatar size="180px" class="shadow-5">
            <q-img :src="avatarPreview ?? userAvatar ?? ''" v-if="avatarPreview || userAvatar"
                   class="cursor-pointer"
                   :class="{ 'avatar-hover': isCurrentUser }">
              <template v-slot:error>
                <div class="text-h4 text-weight-bold">{{ getInitials(editableUser) }}</div>
              </template>
              <template v-if="isCurrentUser" v-slot:loading>
                <q-spinner-dots color="white" size="24px" />
              </template>
            </q-img>
            <div v-else class="text-h4 text-weight-bold bg-primary text-white flex flex-center">
              {{ getInitials(editableUser) }}
            </div>
          </q-avatar>
          <div class="q-pt-sm" v-if="isCurrentUser">
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
        <div class="profile-name q-mt-md">
          <div class="text-h4 text-weight-bold text-primary">
            {{ editableUser.firstName }} {{ editableUser.lastName }}
          </div>
          <div class="text-subtitle1 text-grey-7">{{ editableUser.email }}</div>
        </div>

        <!-- Role Chips -->
        <div class="role-chips q-mt-md">
          <q-chip v-for="role in editableUser.role"
                  :key="role"
                  :color="getRoleColor(role)"
                  text-color="white"
                  size="md"
                  class="shadow-2">
            <q-icon name="badge" class="q-mr-xs" />
            {{ role }}
          </q-chip>
        </div>
      </div>

      <q-separator />

      <!-- Main Content -->
      <q-card-section class="q-pa-lg">
        <div class="row q-col-gutter-md">
          <!-- User Information Section -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="content-card">
              <q-card-section>
                <div class="text-h6 text-primary q-mb-md">
                  <q-icon name="person" class="q-mr-sm" />
                  User Information
                </div>
                <template v-if="isCurrentUser">
                  <div class="row q-col-gutter-md">
                    <div class="col-12" v-for="field in userInfoFields" :key="field.label">
                      <q-input
                        :model-value="editableFields[field.key as keyof typeof editableFields]"
                        @update:model-value="(value) => updateField(field.key, value)"
                        :label="field.label"
                        :type="field.key === 'dateOfBirth' ? 'text' : field.type"
                        :mask="field.key === 'dateOfBirth' ? '####-##-##' : undefined"
                        outlined
                        dense
                        stack-label
                        autogrow
                      >
                        <template v-if="field.key === 'dateOfBirth'" v-slot:append>
                          <q-icon name="event" class="cursor-pointer">
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                              <q-date v-model="editableFields[field.key as keyof typeof editableFields]"
                                     mask="YYYY-MM-DD"
                                      />
                            </q-popup-proxy>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                    <div class="q-ml-xs">
                      <q-checkbox
                        v-model="editableUser.drivingLicense"
                        label="Driving License"
                        stack-label
                      />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="row q-col-gutter-md">
                    <div class="col-12" v-for="field in userInfoFields" :key="field.label">
                      <div class="field-display">
                        <div class="text-subtitle2 text-grey-7">{{ field.label }}</div>
                        <div class="text-body1">
                          {{ formatFieldValue(editableUser[field.key as keyof typeof editableFields], field.type) }}
                        </div>
                      </div>
                    </div>
                    <div class="q-ml-xs">
                      <q-checkbox
                        v-model="editableUser.drivingLicense"
                        label="Driving License"
                        stack-label
                        :disable="true"
                      />
                    </div>
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </div>

          <!-- Availability Section -->
          <div class="col-12 col-md-6">
            <q-card flat bordered class="content-card">
              <q-card-section>
                <div class="text-h6 text-primary q-mb-md">
                  <q-icon name="location_on" class="q-mr-sm" />
                  Centre assignment
                </div>
                <div class="q-mt-sm">
                  <template v-if="editableUser?.adminCentre && editableUser.adminCentre.length > 0">
                    <q-chip
                      v-for="centre in editableUser.adminCentre"
                      :key="centre"
                      color="primary"
                      text-color="white"
                      size="md"
                      icon="location_city"
                      class="shadow-2 q-mr-sm">
                      {{ centre }}
                    </q-chip>
                  </template>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="text-h6 text-primary q-mb-md">
                  <q-icon name="schedule" class="q-mr-sm" />
                  Availability
                </div>
                <template v-if="isCurrentUser">
                  <div class="row q-col-gutter-md">
                    <div class="col-12" v-for="field in availabilityFields" :key="field.label">
                      <q-input
                        :model-value="editableFields[field.key as keyof typeof editableFields]"
                        @update:model-value="(value) => updateField(field.key, value)"
                        :label="field.label"
                        :type="field.type"
                        outlined
                        autogrow
                        stack-label
                        :hint="field.hint"
                        hide-hint
                      />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="row q-col-gutter-md">
                    <div class="col-12" v-for="field in availabilityFieldsStranger" :key="field.label">
                      <div class="field-display">
                        <div class="text-subtitle2 text-grey-7">{{ field.label }}</div>
                        <div class="text-body1">
                          {{ formatFieldValue(editableUser[field.key as keyof typeof editableFields], field.type) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-card-section>
            </q-card>
          </div>

          <!-- Exam Administration Section -->
          <div class="col-12">
            <q-card flat bordered class="content-card">
              <q-card-section>
                <div class="text-h6 text-primary q-mb-md">
                  <q-icon name="school" class="q-mr-sm" />
                  Exam Administration
                </div>
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                    <q-list bordered separator>
                      <q-item>
                        <q-item-section>
                          <q-toggle
                            v-model="editableUser.totaraDone"
                            color="positive"
                            :label="editableUser.totaraDone ? 'Totara Training Completed' : 'Totara Training Uncompleted'"
                            :disable="!isCurrentUser"
                          >
                            <q-tooltip :class="editableUser.totaraDone ? 'bg-positive' : 'bg-negative'">
                              {{ editableUser.totaraDone ? 'Training completed. Thank you!' : 'Please complete the training.' }}
                            </q-tooltip>
                          </q-toggle>
                        </q-item-section>
                      </q-item>

                      <!-- Added Totara Date Input -->
                      <q-item>
                        <q-item-section>
                          <q-input
                            v-model="editableFields.totaraDate"
                            label="Totara Completion Date"
                            mask="####-##-##"
                            :disable="!editableUser.totaraDone || !isCurrentUser"
                            outlined
                            dense
                          >
                            <q-tooltip :class="editableUser.totaraDone ? 'bg-positive' : 'bg-negative'">
                              {{ editableUser.totaraDone ? 'Select date of completion' : 'Complete training first' }}
                            </q-tooltip>
                            <template v-slot:append>
                              <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                  <q-date
                                    v-model="editableFields.totaraDate"
                                    mask="YYYY-MM-DD"
                                    :disable="!editableUser.totaraDone || !isCurrentUser"
                                  />
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </q-item-section>
                      </q-item>

                      <q-item>
                        <q-item-section>
                          <q-toggle
                            v-model="editableUser.insperaAccount"
                            color="positive"
                            :label="editableUser.insperaAccount ? 'Active Inspera Account' : 'Inactive Inspera Account'"
                            :disable="!isCurrentUserAdmin"
                          >
                            <q-tooltip :class="editableUser.insperaAccount ? 'bg-positive' : 'bg-negative'">
                              {{ editableUser.insperaAccount ? 'Account active' : 'Account needs activation' }}
                            </q-tooltip>
                          </q-toggle>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>

                  <div class="col-12 col-md-6" v-if="showExamCounts">
                    <q-list bordered>
                      <q-item v-if="editableUser._count?.supervisedExams !== undefined">
                        <q-item-section avatar>
                          <q-icon name="visibility" color="primary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Supervised Exams</q-item-label>
                          <q-item-label caption>{{ editableUser._count.supervisedExams }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="editableUser._count?.invigilatedExams !== undefined">
                        <q-item-section avatar>
                          <q-icon name="rule" color="secondary" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Invigilated Exams</q-item-label>
                          <q-item-label caption>{{ editableUser._count.invigilatedExams }}</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item v-if="editableUser._count?.examinedExams !== undefined">
                        <q-item-section avatar>
                          <q-icon name="assignment" color="accent" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Examined Exams</q-item-label>
                          <q-item-label caption>{{ editableUser._count.examinedExams }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Admin Note Section -->
          <div class="col-12" v-if="isCurrentUserAdmin">
            <q-card flat bordered class="content-card">
              <q-card-section>
                <div class="text-h6 text-primary q-mb-md">
                  <q-icon name="admin_panel_settings" class="q-mr-sm" />
                  Admin Notes
                </div>
                <q-input
                  v-model="editableUser.adminNote"
                  type="textarea"
                  outlined
                  autogrow
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <!-- Action Buttons -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn v-if="isCurrentUser"
               :disable="isUpdating"
               color="primary"
               @click="updateProfile"
               :loading="isUpdating"
               class="q-px-md">
          Update Profile
        </q-btn>
        <q-btn v-if="isCurrentUserAdmin"
               :disable="((!hasAdminNoteChanges && !hasInsperaAccountChanges ) || isUpdating)"
               color="secondary"
               @click="updateAdminNote"
               :loading="isUpdating"
               class="q-px-md">
          Admin Update
          <q-tooltip>Save admin note or inspera account status</q-tooltip>
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
import { getRoleColor, getLevelColor } from 'src/helpers/Color';
import { formatDateString } from 'src/helpers/FormatTime';
import { deepEqual, normalizeDateString } from 'src/helpers/deepEqual';
import { parseISO, format } from 'date-fns';
import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { useAuth } from 'src/composables/useAuth';
import { useUser } from 'src/composables/useUser';
import { NotificationService } from 'src/utils/services/notificationService';


const props = defineProps<{
  user: User | null;
  userAvatar: string | null;
}>();

type EditableFieldKey = 'firstName' | 'lastName' | 'email' | 'dateOfBirth' | 'phone' | 'note' | 'noteLonger' | 'totaraDate';

type EditableFields = {
  [K in EditableFieldKey]: string;
};

interface EditableUserField {
  key: EditableFieldKey;
  label: string;
  type: 'text' | 'date' | 'email' | 'tel' | 'textarea';
  hint?: string;
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
  { key: 'noteLonger', label: 'Detailed Note (optional)', type: 'textarea', hint: 'Please give us more detailed information about your availability' },
];

const availabilityFieldsStranger: EditableUserField[] = [
  { key: 'note', label: 'Short Note', type: 'text' },
  { key: 'noteLonger', label: 'Detailed Note', type: 'textarea' },
];

const administrationFields: EditableUserField[] = [
  { key: 'totaraDate', label: 'Totara Completion Date', type: 'date' },
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
    [...userInfoFields, ...availabilityFields, ...administrationFields].forEach((field) => {
      const key = field.key;
      if ((key === 'dateOfBirth' || key === 'totaraDate') && editableUser.value?.[key]) {
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

const currentUser = useUser().user;

const isCurrentUser = computed(() => currentUser?.id === editableUser.value?.id);

const isCurrentUserAdmin = computed(() => {
  if (!currentUser.role) return false;
  return currentUser?.role.includes(RoleEnum.Office) || currentUser?.role.includes(RoleEnum.Developer);
});

const datesToCheck = ['DateOfBirth', 'totaraDate'];

const hasChanges = computed(() => !deepEqual(editableUser.value, initialUser.value, datesToCheck));

const hasAdminNoteChanges = computed(() => !deepEqual(editableUser.value?.adminNote, initialUser.value?.adminNote));
const hasInsperaAccountChanges = computed(() => !deepEqual(editableUser.value?.insperaAccount, initialUser.value?.insperaAccount));

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

  const normalizedTotaraDate = normalizeDateString(editableUser.value.totaraDate);
  const normalizedEditableTotaraDate = normalizeDateString(editableFields.totaraDate);

  const normalizedDateOfBirth = normalizeDateString(editableUser.value.dateOfBirth);
  const normalizedEditableDateOfBirth = normalizeDateString(editableFields.dateOfBirth);

  const datesUnchanged =
    normalizedTotaraDate === normalizedEditableTotaraDate &&
    normalizedDateOfBirth === normalizedEditableDateOfBirth;

  if (!hasChanges.value && datesUnchanged) {
    NotificationService.info('No changes detected.');
    return;
  }

  isUpdating.value = true;
  try {
    await useUser().updateProfile(
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
      editableUser.value.totaraDone,
      editableUser.value.insperaAccount
    );


    if(useUser().updateConfirmation){
      useUser().changeConfirmation(false);
      await useUser().getProfile(editableUser.value.id);
      await useAuth().getToken();
      await useUser().refreshUserInfo();
      if (useUser().selectedUser) {
        editableUser.value = { ...useUser().selectedUser };
        initialUser.value = { ...useUser().selectedUser };
        updateEditableFields();
      }
  }
  } finally {
    isUpdating.value = false;
  }
};

const updateAdminNote = async () => {
  if (!editableUser.value) return;

  isUpdating.value = true;
  try {
    if(hasAdminNoteChanges.value){
    await useUser().updateAdminNote(
      editableUser.value.id,
      editableUser.value.adminNote
    );
    }

    if(hasInsperaAccountChanges.value){
    await useUser().updateInsperaAccount(
      editableUser.value.id,
      editableUser.value.insperaAccount
    );
    }

    await useUser().getProfile(editableUser.value.id);
    if (useUser().selectedUser) {
      editableUser.value = { ...useUser().selectedUser };
      initialUser.value = { ...useUser().selectedUser };
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
              await useUser().uploadAvatar(croppedFile);
              await useUser().getProfile(editableUser.value.id);
              await useUser().getUserAvatarById(editableUser.value.id);
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
  padding: 2rem;
}

.profile-card {
  width: 100%;
  max-width: 800px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
    margin: 0;
    border-radius: 0;
  }

  .profile-container {
    padding: 0;
  }
}

.q-checkbox {
  margin-left: -10px;
}

.q-chip {
  font-weight: 600;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

.q-card-section {
  padding: 1.5rem;
}

.responsive-input {
  .q-field__label {
    line-height: 1.2;
    white-space: normal;
    max-width: 100%;
  }

  // Ensure proper spacing for wrapped labels
  &.q-field--labeled {
    .q-field__control-container {
      padding-top: 28px;
    }
  }

  // Adjust spacing for dense fields
  &.q-field--dense.q-field--labeled {
    .q-field__control-container {
      padding-top: 24px;
    }
  }

  // Better handling of long labels on small screens
  @media (max-width: 599px) {
    .q-field__label {
      font-size: 0.875rem;
    }

    &.q-field--labeled {
      .q-field__control-container {
        padding-top: 24px;
      }
    }
  }
}
</style>
