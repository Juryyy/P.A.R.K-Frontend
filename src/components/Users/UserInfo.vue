<template>
  <q-page class="card-container">
    <q-card bordered class="custom-card" v-if="editableUser">
      <h3 v-if="editableUser.deactivated" class="text-red">This account has been deactivated!</h3>
      <q-card-section class="q-pr-md">
        <q-avatar size="175px">
          <q-img :src="userAvatar" v-if="userAvatar" />
          <div v-else class="text-h6 text-weight-bold">No avatar available</div>
        </q-avatar>
        <div class="q-mt-md q-pr-xl">
          <q-input
            v-model="editableUser.firstName"
            label="First Name"
            class="q-my-sm"
            :disable="!isCurrentUser"
          />
          <q-input
            v-model="editableUser.lastName"
            label="Last Name"
            class="q-my-sm"
            :disable="!isCurrentUser"
          />
          <q-input
            v-model="editableUser.email"
            label="Email"
            class="q-my-sm"
            :disable="!isCurrentUser"
          />
          <q-input
            v-model="editableUser.dateOfBirth"
            label="Date of Birth"
            class="q-my-sm"
            :disable="!isCurrentUser"
            type="date"
          />
          <q-input
            v-model="editableUser.phone"
            label="Phone"
            class="q-my-sm"
            :disable="!isCurrentUser"
          />
          <q-toggle
            v-model="editableUser.drivingLicense"
            label="Driving License"
            class="q-my-sm"
            :disable="!isCurrentUser"
          />
          <q-input
            v-model="editableUser.note"
            label="Note - short info about availability"
            class="q-my-sm"
            :disable="!isCurrentUser"
          />
          <q-input
            v-model="editableUser.noteLonger"
            label="Detailed Note"
            class="q-my-sm"
            :disable="!isCurrentUser"
          />
          <div class="q-my-sm">
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
          <div class="q-my-sm" v-if="editableUser.level">
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
            editableUser._count.invigilatedExams !== undefined  &&
            (editableUser.role.includes(RoleEnum.Supervisor) || editableUser.role.includes(RoleEnum.Invigilator))"
            class="text-body1 q-my-sm"
          >
            <b>Supervised / Invigilated Exams:</b> {{ editableUser._count.supervisedExams }} / {{ editableUser._count.invigilatedExams }}
          </q-item-label>
          <q-item-label
            v-if="editableUser._count && editableUser._count.examinedExams !== undefined && editableUser.role.includes(RoleEnum.Examiner)"
            class="text-body1 q-my-sm"
          >
            <b>Examined Exams:</b> {{ editableUser._count.examinedExams }}
          </q-item-label>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :disable="!hasChanges || !isCurrentUser" :color="hasChanges && isCurrentUser ? 'primary' : 'grey'" @click="updateProfile">Update Profile</q-btn>
      </q-card-actions>
    </q-card>
    <div v-else>No user information available.</div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { RoleEnum, User } from 'src/stores/db/types';
import { defineProps } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { getRoleColor, getLevelColor } from 'src/helpers/Color';

const props = defineProps<{
  user: User | null;
  userAvatar: string | null;
}>();

const userStore = useUserStore();

const editableUser = ref<User | null>(props.user ? { ...props.user } : null);

const currentUser = userStore.user;

const isCurrentUser = computed(() => {
  return currentUser?.id === editableUser.value?.id;
});

const hasChanges = computed(() => {
  return JSON.stringify(editableUser.value) !== JSON.stringify(props.user);
});

watch(() => props.user, (newUser) => {
  editableUser.value = newUser ? { ...newUser } : null;
});

const updateProfile = () => {
  if (editableUser.value) {
    console.log(editableUser.value);
    // Here, you would call the actual update API or method to update the user profile
  }
};
</script>

<style lang="scss" scoped>
.card-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
}

.custom-card {
  max-width: 400px;
  width: 100%;
  margin: 20px;
  position: relative;
}

.avatar-container {
  position: absolute;
  top: 20px; /* Adjust top distance as needed */
  right: 0px;
}
</style>
