<template>
  <div class="container q-pa-md">
    <q-card class="substitution-card" bordered>
      <q-card-section>
        <div class="text-h6 text-primary text-center q-mb-md">
          <q-icon name="swap_horiz" class="q-mr-sm" />
          Available Substitutions
        </div>
      </q-card-section>
      <q-card-section  class="q-pb-none">
        <SubstitutionFilterComponent
          :substitutions="substitutions"
          :user-id="user.id"
          :has-user-applied="hasUserApplied"
          :is-owned-by-user="isOwnedByUser"
          @update:filters="updateFilters"
        />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-md">
        <template v-if="hasSubstitutions">
          <div class="substitution-grid">
            <div v-for="(substitution, index) in filteredSubstitutions"
                 :key="substitution.id"
                 :class="[
                   'col-12',
                   filteredSubstitutions.length === 1 ? 'col-md-12' : 'col-md-6',
                   filteredSubstitutions.length === 1 ? 'col-lg-12' : 'col-lg-6',
                   // Add left padding to align with first card if it's third+ card
                   index >= 2 ? 'q-pl-md-auto' : ''
                 ]">
                <q-card
                 bordered
                 class="sub-item-card"
                 :class="{'your-request': isOwnedByUser(substitution.id),
                   'available': isAvailableForUser(substitution),
                   'applied': hasUserApplied(substitution.id)
                 }"
                  >
                  <div
                    v-if="isOwnedByUser(substitution.id)"
                    class="status-banner your-request q--avoid-card-border"
                  >
                    Your Request
                  </div>
                  <div
                    v-else-if="isAvailableForUser(substitution)"
                    class="status-banner available q--avoid-card-border"
                  >
                    Available
                  </div>
                  <div
                    v-else-if="hasUserApplied(substitution.id)"
                    class="status-banner applied q--avoid-card-border"
                  >
                    Applied
                  </div>

                <q-card-section>
                  <!-- Exam Info Header -->
                  <div class="row items-center justify-between q-mb-md">
                    <div class="text-h6 text-weight-bold text-primary">{{ substitution.exam.type }}</div>
                    <q-chip
                      :color="getStatusColor(substitution.status)"
                      text-color="white"
                      class="shadow-2">
                      {{ substitution.status }}
                    </q-chip>
                  </div>

                  <!-- Location and Time -->
                  <div class="row q-gutter-sm q-mb-md">
                    <q-chip outline color="primary" class="shadow-1">
                      <q-icon name="location_on" left />
                      {{ substitution.exam.venue }} - {{ substitution.exam.location }}
                    </q-chip>
                    <q-chip outline color="secondary" class="shadow-1">
                      <q-icon name="event" left />
                      {{ formatDateString(substitution.exam.startTime) }}
                    </q-chip>
                    <q-chip outline color="accent" class="shadow-1">
                      <q-icon name="schedule" left />
                      {{ formatTimeString(substitution.exam.startTime) }} - {{ formatTimeString(substitution.exam.endTime) }}
                    </q-chip>
                  </div>

                  <!-- Role and Requestor -->
                  <div class="row q-col-gutter-sm q-mb-md">
                    <div class="col-12 col-sm-6">
                      <div class="text-subtitle2 text-grey-7">Required Role:</div>
                      <q-chip
                        :color="getRoleColor(substitution.originalRole)"
                        text-color="white"
                        class="shadow-2">
                        <q-icon name="badge" class="q-mr-xs" />
                        {{ substitution.originalRole }}
                      </q-chip>
                    </div>
                    <div class="col-12 col-sm-6">
                      <div class="text-subtitle2 text-grey-7">Requested By:</div>
                      <div class="text-body1 text-weight-medium">
                        {{ substitution.requestedBy.firstName }} {{ substitution.requestedBy.lastName }}
                      </div>
                    </div>
                  </div>

                  <!-- Applications Info -->
                  <q-separator class="q-my-md" />
                  <div class="row items-center justify-between">
                    <div class="applications-info text-body2">
                      <q-icon name="people" size="sm" class="q-mr-xs" />
                      <span>{{ substitution._count.applications }} applications</span>
                    </div>

                    <!-- Apply Button -->
                    <q-btn
                    v-if="!hasUserApplied(substitution.id) && !isOwnedByUser(substitution.id)"
                    color="primary"
                    label="Apply"
                    :disable="isButtonDisabled(substitution)"
                    @click="applyForSubstitution(substitution.id)"
                    :loading="loadingStates[substitution.id]"
                    class="q-px-md shadow-2"
                  >
                    <q-tooltip>
                      {{ getButtonTooltip(substitution) }}
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    v-else-if="hasUserApplied(substitution.id)"
                    color="negative"
                    label="Withdraw"
                    @click="withdrawApplication(substitution.id)"
                    :loading="loadingStates[substitution.id]"
                    class="q-px-md shadow-2"
                  >
                    <q-tooltip>
                      Click to withdraw your application
                    </q-tooltip>
                  </q-btn>

                  <q-btn
                    v-else-if="isOwnedByUser(substitution.id)"
                    color="warning"
                    label="Revoke"
                    @click="cancelSubstitution(substitution.id)"
                    :loading="loadingStates[substitution.id]"
                    class="q-px-md shadow-2"
                  >
                    <q-tooltip>
                      Click to revoke this substitution request
                    </q-tooltip>
                  </q-btn>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </template>

        <!-- No Substitutions Message -->
        <template v-else>
          <div class="text-center q-pa-xl">
            <q-icon name="swap_horiz" size="48px" color="grey-5" />
            <div class="text-h6 text-grey-7 q-mt-md">
              No substitutions available for you now, check back later
            </div>
          </div>
        </template>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue'
import { formatDateString, formatTimeString } from 'src/helpers/FormatTime'
import { getRoleColor } from 'src/helpers/Color'
import { useSubstitutionStore } from 'stores/substitutionStore'
import { SubstitutionRequest, SubstitutionStatusEnum } from 'src/db/types'
import { useUserStore } from 'stores/userStore'
import { storeToRefs } from 'pinia'

const substitutionStore = useSubstitutionStore()
const userStore = useUserStore()

const { substitutions, myApplications } = storeToRefs(substitutionStore)
const { user } = storeToRefs(userStore)

const loadingStates = reactive<{ [key: number]: boolean }>({})

const canViewRole = (userRoles: string[], requiredRole: string) => {
  if (userRoles.includes(requiredRole)) {
    return true;
  }

  if (userRoles.includes('Office')) {
    return ['Supervisor', 'Invigilator'].includes(requiredRole);
  }

  if (userRoles.includes('Supervisor')) {
    return requiredRole === 'Invigilator';
  }

  return false;
};


const filteredSubstitutions = computed(() => {
  let filtered = substitutions.value.filter(substitution =>
    canViewRole(user.value.role, substitution.originalRole)
  )

  if (activeFilters.value.roles.length > 0) {
    filtered = filtered.filter(sub =>
      activeFilters.value.roles.includes(sub.originalRole)
    )
  }

  if (activeFilters.value.showMyRequests) {
    filtered = filtered.filter(sub =>
      sub.requestedBy.id === user.value.id
    )
  }

  if (activeFilters.value.showMyApplications) {
    filtered = filtered.filter(sub =>
      hasUserApplied.value(sub.id)
    )
  }

  if (activeFilters.value.showAvailableOnly) {
    filtered = filtered.filter(sub =>
      isAvailableForUser(sub)
    )
  }

  return filtered
})

const hasSubstitutions = computed(() => filteredSubstitutions.value.length > 0)

const hasUserApplied = computed(() => (substitutionId: number) => {
  return myApplications.value.some(application => application.substitutionId === substitutionId);
});

const isButtonDisabled = computed(() => (substitution: SubstitutionRequest) => {
  return substitution.status !== 'Open' ||
         substitution.requestedBy.id === user.value.id ||
         hasUserApplied.value(substitution.id);
});

const isOwnedByUser = computed(() => (substitutionId: number) => {
  return substitutions.value.some(substitution => substitution.id === substitutionId && substitution.requestedBy.id === user.value.id);
});

const cancelSubstitution = async (substitutionId: number) => {
  loadingStates[substitutionId] = true;
  try {
    await substitutionStore.cancelSubstitution(substitutionId);
    await substitutionStore.loadSubstitutions();
    await substitutionStore.loadMyApplications();
  } finally {
    loadingStates[substitutionId] = false;
  }
};

const getButtonTooltip = computed(() => (substitution: SubstitutionRequest) => {
  if (substitution.requestedBy.id === user.value.id) {
    return 'You cannot apply for your own substitution request';
  }
  if (hasUserApplied.value(substitution.id)) {
    return 'You have already applied for this substitution';
  }
  if (substitution.status !== 'Open') {
    return 'This substitution is no longer accepting applications';
  }
  return 'Apply for this substitution';
});

const getApplicationId = (substitutionId: number) => {
  const application = myApplications.value.find(app => app.substitutionId === substitutionId);
  return application?.id;
};

const withdrawApplication = async (substitutionId: number) => {
  const applicationId = getApplicationId(substitutionId);

  if (!applicationId) {
    console.error('Application not found');
    return;
  }
  loadingStates[substitutionId] = true;
  try {
    await substitutionStore.withdrawApplication(applicationId); // Assuming your store has this method
    await substitutionStore.loadSubstitutions(); // Refresh data
    await substitutionStore.loadMyApplications();
  } finally {
    loadingStates[substitutionId] = false;
  }
};


const getStatusColor = (status: SubstitutionStatusEnum) => {
  switch (status) {
    case 'Open':
      return 'positive'
    case 'Assigned':
      return 'primary'
    case 'Closed':
      return 'grey'
    default:
      return 'grey'
  }
}

const applyForSubstitution = async (substitutionId: number) => {
  loadingStates[substitutionId] = true
  try {
    await substitutionStore.applyForSubstitution(substitutionId)
    await substitutionStore.loadSubstitutions()
    await substitutionStore.loadMyApplications();
  } finally {
    loadingStates[substitutionId] = false
  }
}

const isAvailableForUser = (substitution: SubstitutionRequest) => {
  return substitution.status === 'Open' &&
         !hasUserApplied.value(substitution.id) &&
         !isOwnedByUser.value(substitution.id);
}


//Filter part
import { RoleEnum } from 'src/db/types'
import SubstitutionFilterComponent from './SubstitutionFilterComponent.vue'

interface Filters {
  roles: RoleEnum[]
  showMyRequests: boolean
  showMyApplications: boolean
  showAvailableOnly: boolean

}

const activeFilters = ref<Filters>({
  roles: [],
  showMyRequests: false,
  showMyApplications: false,
  showAvailableOnly: false
})

const updateFilters = (newFilters: Filters) => {
  activeFilters.value = newFilters
}

</script>

<style lang="scss" scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  min-width: 1000px;

  @media (max-width: 599px) {
    min-width: 100%;
  }
}

.substitution-card {
  width: 100%;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.substitution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 1rem;
  width: 100%;
}

.sub-item-card {
  transition: all 0.3s ease;
  height: 100%;
  min-width: 450px;
  position: relative;
  border: 1px solid #e0e0e0;
  overflow: visible !important; /* This ensures the banner isn't cut off */

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:only-child {
    grid-column: 1 / -1;
    max-width: 450px;
  }

  /* Card states */
  &.your-request {
    border-top: 4px solid #FF9800;
  }

  &.available {
    border: 2px solid #21BA45;
  }

  &.applied {
    border-top: 4px solid #9C27B0;
  }
}


@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.01);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.status-banner {
  position: absolute;
  left: 50%;
  top: -1px;
  transform: translateX(-50%);
  padding: 2px 16px;
  border-radius: 0 0 8px 8px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  font-size: 0.8rem;
  font-weight: 500;
  color: white;
  z-index: 1;

  &.your-request {
    background: #FF9800;
    border-radius: 0 0 8px 8px;
  }

  &.available {
    background: #21BA45;
    border-radius: 0 0 8px 8px;
  }

  &.applied {
    background: #9C27B0;
    border-radius: 0 0 8px 8px;
  }
}

@media (max-width: 599px) {
  .substitution-card {
    border-radius: 0;
  }

  .container {
    padding: 0;
  }

  .substitution-grid {
    grid-template-columns: 1fr;
  }

  .sub-item-card {
    min-width: 100%;

    &:only-child {
      max-width: 100%;
    }
  }
}

.applications-info {
  display: flex;
  align-items: center;
  color: $grey-7;
}

.q-chip {
  font-weight: 600;
  transition: transform 0.2s ease;
}

@media (max-width: 599px) {
  .substitution-card {
    border-radius: 0;
  }

  .container {
    padding: 0;
  }
}
</style>
