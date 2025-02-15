// SubstitutionFilters.vue
<template>
  <div class="filter-container q-pb-md">
    <div class="q-col-gutter-sm items-center">
      <!-- Role filters -->
      <div class="col-12 col-sm-auto">
        <b>
          <q-icon name="badge" class="q-mr-xs" />
          Role Filters
        </b>
        <q-chip
          v-for="role in availableRoles"
          :key="role"
          :selected="selectedFilters.roles.includes(role)"
          clickable
          @click="toggleRoleFilter(role)"
          :color="selectedFilters.roles.includes(role) ? getRoleColor(role) : 'grey-3'"
          :text-color="selectedFilters.roles.includes(role) ? 'white' : 'grey-8'"
          class="q-ma-sm"
        >
          <q-icon name="badge" class="q-mr-xs" />
          {{ role }}
        </q-chip>
      </div>

      <!-- Personal filters -->
      <div class="col-12 col-sm-auto">
        <b>
          <q-icon name="filter_list" class="q-mr-xs" />
          Personal Filters
        </b>
        <q-chip
          clickable
          :selected="selectedFilters.showMyRequests"
          @click="toggleMyRequests"
          :color="selectedFilters.showMyRequests ? 'purple' : 'grey-3'"
          :text-color="selectedFilters.showMyRequests ? 'white' : 'grey-8'"
          class="q-ma-sm"
        >
          <q-icon name="person" class="q-mr-xs" />
          My Requests
        </q-chip>

        <q-chip
          clickable
          :selected="selectedFilters.showMyApplications"
          @click="toggleMyApplications"
          :color="selectedFilters.showMyApplications ? 'deep-purple' : 'grey-3'"
          :text-color="selectedFilters.showMyApplications ? 'white' : 'grey-8'"
          class="q-ma-sm"
        >
          <q-icon name="how_to_reg" class="q-mr-xs" />
          My Applications
        </q-chip>

        <q-chip
        clickable
        :selected="selectedFilters.showAvailableOnly"
        @click="toggleAvailableOnly"
        :color="selectedFilters.showAvailableOnly ? 'green' : 'grey-3'"
        :text-color="selectedFilters.showAvailableOnly ? 'white' : 'grey-8'"
        class="q-ma-sm"
      >
        <q-icon name="check_circle" class="q-mr-xs" />
        Available to Apply
      </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { getRoleColor } from 'src/helpers/Color'
import { RoleEnum } from 'src/db/types'

interface Props {
  substitutions: Array<{
    id: number
    originalRole: RoleEnum
    requestedBy: {
      id: number
    }
    status: string
  }>
  userId: number
  hasUserApplied: (id: number) => boolean
  isOwnedByUser: (id: number) => boolean
}

interface Filters {
  roles: RoleEnum[]
  showMyRequests: boolean
  showMyApplications: boolean
  showAvailableOnly: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hasUserApplied: () => () => false,
  isOwnedByUser: () => () => false
})

const emit = defineEmits<{
  (e: 'update:filters', filters: Filters): void
}>()

const selectedFilters = ref<Filters>({
  roles: [],
  showMyRequests: false,
  showMyApplications: false,
  showAvailableOnly: false
})

const availableRoles = computed(() => {
  const roles = props.substitutions.map(sub => sub.originalRole)
  return [...new Set(roles)]
})

const toggleRoleFilter = (role: RoleEnum) => {
  const newRoles = selectedFilters.value.roles.includes(role)
    ? selectedFilters.value.roles.filter(r => r !== role)
    : [...selectedFilters.value.roles, role]

  selectedFilters.value = {
    ...selectedFilters.value,
    roles: newRoles
  }

  emit('update:filters', selectedFilters.value)
}

const toggleMyRequests = () => {
  selectedFilters.value = {
    ...selectedFilters.value,
    showMyRequests: !selectedFilters.value.showMyRequests,
    showMyApplications: false,
    showAvailableOnly: false
  }

  emit('update:filters', selectedFilters.value)
}

const toggleMyApplications = () => {
  selectedFilters.value = {
    ...selectedFilters.value,
    showMyApplications: !selectedFilters.value.showMyApplications,
    showMyRequests: false,
    showAvailableOnly: false
  }

  emit('update:filters', selectedFilters.value)
}

const toggleAvailableOnly = () => {
  selectedFilters.value = {
    ...selectedFilters.value,
    showAvailableOnly: !selectedFilters.value.showAvailableOnly,
    showMyRequests: false,
    showMyApplications: false
  }

  emit('update:filters', selectedFilters.value)
}

</script>

<style lang="scss" scoped>
.filter-container {
  .q-chip {
    &.q-chip--selected {
      .q-icon {
        opacity: 1;
      }
    }

    .q-icon {
      opacity: 0.8;
    }

    &:hover {
      transform: translateY(-1px);
    }
  }
}
</style>
