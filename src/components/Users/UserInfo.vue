<template>
  <q-page class="card-container">
    <q-card bordered class="custom-card" v-if="props.user">
      <h3 v-if="props.user.deactivated" class="text-red">This account has been deactivated!</h3>
      <q-card-section class="q-pr-xl">
        <q-avatar size="200px">
          <q-img :src="props.userAvatar" v-if="props.userAvatar" />
          <div v-else class="text-h6 text-weight-bold">No avatar available</div>
        </q-avatar>
        <div class="q-mt-md q-pr-xl">
          <q-item-label class="text-weight-bold text-h4 q-mb-md">
            {{ props.user.firstName }} {{ props.user.lastName }}
          </q-item-label>
          <q-item-label class="text-body1 q-my-sm"><b>Role:</b> {{ props.user.role.join(', ') }}</q-item-label>
          <q-item-label class="text-body1 q-my-sm"><b>Email:</b> {{ props.user.email }}</q-item-label>
          <q-item-label class="text-body1 q-my-sm"><b>Phone:</b> {{ props.user.phone }}</q-item-label>
          <q-item-label class="text-body1 q-my-sm"><b>Driving License:</b> {{ props.user.drivingLicense ? 'Yes' : 'No' }}</q-item-label>
          <q-item-label class="text-body1 q-my-sm"><b>Account Activated:</b> {{ props.user.activatedAccount ? 'Yes' : 'No' }}</q-item-label>
          <q-item-label class="text-body1 q-my-sm" v-if="props.user._count && props.user._count.supervisedExams !== undefined && !props.user.role.includes(RoleEnum.Examiner)">
            <b>Supervised Exams:</b> {{ props.user._count.supervisedExams }}
          </q-item-label>
          <q-item-label class="text-body1 q-my-sm" v-if="props.user._count && props.user._count.invigilatedExams !== undefined && !props.user.role.includes(RoleEnum.Examiner)">
            <b>Invigilated Exams:</b> {{ props.user._count.invigilatedExams }}
          </q-item-label>
          <q-item-label class="text-body1 q-my-sm" v-if="props.user._count && props.user._count.examinedExams !== undefined && props.user.role.includes(RoleEnum.Examiner)">
            <b>Examined Exams:</b> {{ props.user._count.examinedExams }}
          </q-item-label>
        </div>
      </q-card-section>
    </q-card>
    <div v-else>No user information available.</div>
  </q-page>
</template>

<script setup lang="ts">
import { RoleEnum, User } from 'src/stores/db/types';

const props = defineProps<{
  user: User | null;
  userAvatar: string | null;
}>();

</script>

<style lang="scss" scoped>
.card-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: 100vh;
  margin-top: 20px; /* Adjust top margin as needed */
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
