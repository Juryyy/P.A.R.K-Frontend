<template>
  <div class="card-container">
    <q-card bordered class="custom-card" v-if="editableUser">
      <h3 v-if="editableUser.deactivated" class="text-red">This account has been deactivated!</h3>
      <q-card-section class="q-pr-md">
        <q-avatar size="175px">
          <q-img :src="userAvatar" v-if="userAvatar" />
          <div v-else class="text-h6 text-weight-bold">No avatar available</div>
        </q-avatar>
        <div class="q-pr-xl">
          <template v-if="isCurrentUser">
            <q-input
              v-model="editableUser.firstName"
              label="First Name"
              :input-style="{ fontWeight: 'bold' }"
            />
            <q-input
              v-model="editableUser.lastName"
              label="Last Name"
              :input-style="{ fontWeight: 'bold' }"
            />
            <q-input
              v-model="editableUser.email"
              label="Email"
              :input-style="{ fontWeight: 'bold' }"
            />
            <q-input
              v-model="dateOfBirthFormatted"
              label="Date of Birth"
              type="date"
              :input-style="{ fontWeight: 'bold' }"
            />
            <q-input
              v-model="editableUser.phone"
              label="Phone"
              :input-style="{ fontWeight: 'bold' }"
            />
            <q-checkbox
              v-model="editableUser.drivingLicense"
              label="Driving License"
            />
            <q-input
              v-model="editableUser.note"
              label="Note - short info about availability"
              :input-style="{ fontWeight: 'bold' }"
            />
            <q-input
              v-model="editableUser.noteLonger"
              label="Detailed Note"
              :input-style="{ fontWeight: 'bold' }"
              type="textarea"
            />
          </template>
          <template v-else>
            <div class="q-my-sm">First Name: <b>{{ editableUser.firstName }}</b></div>
            <div class="q-my-sm">Last Name: <b>{{ editableUser.lastName }}</b></div>
            <div class="q-my-sm">Email: <b>{{ editableUser.email }}</b></div>
            <div v-if="editableUser.dateOfBirth" class="q-my-sm">Date of Birth: <b>{{ formatDateString(editableUser.dateOfBirth) }}</b></div>
            <div class="q-my-sm">Phone: <b>{{ editableUser.phone || '--- --- ---' }}</b></div>
            <div class="q-my-sm">Driving License: <q-checkbox v-model="editableUser.drivingLicense" disable /></div>
            <div class="q-my-sm">Note: <b>{{ editableUser.note }}</b></div>
            <div class="q-my-sm">Detailed Note: <b>{{ editableUser.noteLonger }}</b></div>
          </template>

          <q-input v-if="isCurrentUserAdmin"
          v-model="editableUser.adminNote"
          label="Admin Note"
          :input-style="{ fontWeight: 'bold' }"
          type="textarea"
          />
          <div class="q-my-xs">
            <label class="text-body1"><b>Roles:</b></label>
            <div>
              <q-chip
                v-for="role in editableUser.role"
                :key="role"
                class="q-mr-sm"
                :color="getRoleColor(role)"
              >
                {{ role }}
              </q-chip>
            </div>
          </div>
          <div class="q-my-xs" v-if="editableUser.level">
            <label class="text-body1"><b>Levels:</b></label>
            <div>
              <q-chip
                v-for="level in editableUser.level"
                :key="level"
                class="q-mr-sm"
                :color="getLevelColor(level)"
              >
                {{ level }}
              </q-chip>
            </div>
          </div>
          <q-item-label
            v-if="editableUser._count && editableUser._count.supervisedExams !== undefined &&
            editableUser._count.invigilatedExams !== undefined &&
            (editableUser.role.includes(RoleEnum.Supervisor) || editableUser.role.includes(RoleEnum.Invigilator))"
            class="text-body1"
          >
            <b>Supervised / Invigilated Exams:</b> {{ editableUser._count.supervisedExams }} / {{ editableUser._count.invigilatedExams }}
          </q-item-label>
          <q-item-label
            v-if="editableUser._count && editableUser._count.examinedExams !== undefined && editableUser.role.includes(RoleEnum.Examiner)"
            class="text-body1"
          >
            <b>Examined Exams:</b> {{ editableUser._count.examinedExams }}
          </q-item-label>
        </div>
      </q-card-section>
      <q-card-actions v-if="isCurrentUser" align="right">
        <q-btn :disable="!hasChanges || isUpdating" :color="hasChanges && !isUpdating ? 'primary' : 'grey'" @click="updateProfile">
          <template v-if="isUpdating">
            <q-spinner size="20px" />
          </template>
          <template v-else>
            Update Profile
          </template>
        </q-btn>
      </q-card-actions>
    </q-card>
    <div v-else>No user information available.</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { RoleEnum, User } from 'src/db/types';
import { defineProps } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { getRoleColor, getLevelColor } from 'src/helpers/Color';
import { formatDateString } from 'src/helpers/FormatTime';
import deepEqual from 'src/helpers/deepEqual'; // Assumes you have a deepEqual utility function

const props = defineProps<{
  user: User | null;
  userAvatar: string | null;
}>();

const userStore = useUserStore();

const editableUser = ref<User | null>(props.user ? { ...props.user } : null);

const initialUser = ref<User | null>(props.user ? { ...props.user } : null); // Keep a copy of the initial user data

const currentUser = userStore.user;

const isCurrentUser = computed(() => {
  return currentUser?.id === editableUser.value?.id;
});

const isCurrentUserAdmin = computed(() => {
  if(!currentUser.role) return false;
  return currentUser?.role.includes(RoleEnum.Office || RoleEnum.Developer);
});

const hasChanges = computed(() => {
  return !deepEqual(editableUser.value, initialUser.value);
});

const isUpdating = ref(false);

watch(() => props.user, (newUser) => {
  editableUser.value = newUser ? { ...newUser } : null;
  initialUser.value = newUser ? { ...newUser } : null; // Update the initialUser copy when props.user changes
});

const updateProfile = async () => {
  isUpdating.value = true;
  try {
    if (editableUser.value) {
      await userStore.updateProfile(
        editableUser.value.id,
        editableUser.value.email,
        editableUser.value.firstName,
        editableUser.value.lastName,
        editableUser.value.dateOfBirth,
        editableUser.value.note,
        editableUser.value.noteLonger,
        editableUser.value.drivingLicense,
        editableUser.value.phone

      );
      // Fetch the updated user profile
      await userStore.getProfile(editableUser.value.id);
      if (userStore.selectedUser) {
        editableUser.value = { ...userStore.selectedUser };
        initialUser.value = { ...userStore.selectedUser }; // Reset the initialUser after successful update
      }
    }
  } finally {
    isUpdating.value = false;
  }
};

const dateOfBirthFormatted = computed({
  get() {
    return editableUser.value?.dateOfBirth
      ? new Date(editableUser.value.dateOfBirth).toISOString().split('T')[0]
      : '';
  },
  set(value) {
    if (editableUser.value) {
      editableUser.value.dateOfBirth = new Date(value).toISOString();
    }
  },
});
</script>

<style lang="scss" scoped>
.card-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.custom-card {
  max-width: 400px;
  width: 100%;
  position: relative;
}

.avatar-container {
  position: absolute;
  top: 20px; /* Adjust top distance as needed */
  right: 0px;
}
</style>
