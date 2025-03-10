<template>
  <div class="p-4 bg-gray-100 q-ma-sm">
    <q-page class="bg-white rounded-lg shadow-md">
      <div class="p-4">

        <q-table
          bordered
          :title="'Users: ' + filteredUsersCount"
          :rows="filteredUsersRef"
          :columns="columns"
          v-model:pagination="pagination"
          row-key="id"
          class="primary-header"
        >
        <template v-slot:top>
          <div class="row items-center justify-between q-pb-md">
            <h5 class="q-my-none">Users: {{ filteredUsersCount }}</h5>
            <q-input
              v-model="searchQuery"
              placeholder="Search users..."
              class="col-grow q-ml-md"
              outlined
              dense
              bg-color="white"
              debounce="100"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
        </template>
          <template v-slot:body="props">
            <q-tr :props="props" :class="props.rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'">
              <q-td key="firstName">{{ props.row.firstName }}</q-td>
              <q-td key="lastName">{{ props.row.lastName }}</q-td>
              <q-td key="email">{{ props.row.email }}</q-td>
              <q-td key="role">
                <div class="flex flex-wrap gap-2">
                  <q-chip
                    v-for="role in sortRoles(props.row.role)"
                    :key="role"
                    :color="getRoleColor(role)"
                    text-color="black"
                    size="md"
                    class="text-body1"
                  >
                    {{ role }}
                  </q-chip>
                </div>
                <q-popup-edit v-model="props.row.role" :disable="!canEditSenior">
                  <q-select
                    label="Roles"
                    v-model="props.row.role"
                    :options="Roles"
                    multiple
                    emit-value
                    map-options
                    dense
                    use-chips
                    @update:modelValue="handleRoleChange(props.row)"
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="level">
                <div class="flex flex-wrap gap-2">
                  <q-chip
                    v-for="level in sortLevels(props.row.level)"
                    :key="level"
                    :color="getLevelColor(level)"
                    text-color="black"
                    size="md"
                    class="text-body1"
                  >
                    {{ level }}
                  </q-chip>
                </div>
                <q-popup-edit v-model="props.row.level" :disable="!canEditSenior">
                  <q-select
                    label="Levels"
                    v-model="props.row.level"
                    :options="Levels"
                    multiple
                    emit-value
                    map-options
                    dense
                    use-chips
                    @update:modelValue="handleLevelChange(props.row)"
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="isSenior">
                <q-icon
                  :color="props.row.isSenior ? 'red' : 'grey-5'"
                  name="stars"
                  size="md"
                  :class="{ 'cursor-pointer': canEditSenior }"
                  @click="canEditSenior && toggleIsSenior(props.row)"
                >
                  <q-tooltip>{{ props.row.isSenior ? 'Senior' : 'Not Senior' }}</q-tooltip>
                </q-icon>
              </q-td>
              <q-td key="Exams">
                {{ `${props.row._count.supervisedExams} | ${props.row._count.invigilatedExams} | ${props.row._count.examinedExams}` }}
              </q-td>
              <q-td key="actions">
                <div class="flex gap-3">
                  <q-btn
                    v-if="canEditSenior"
                    @click="editUser(props.row)"
                    :color="props.row.isRoleChanged || props.row.isLevelChanged || props.row.isSeniorChanged ? 'blue' : 'grey'"
                    icon="manage_accounts"
                    size="md"
                    round
                    flat
                    :disable="!(props.row.isRoleChanged || props.row.isLevelChanged || props.row.isSeniorChanged)"
                  >
                    <q-tooltip>{{ props.row.isRoleChanged || props.row.isLevelChanged || props.row.isSeniorChanged ? `Update ${props.row.firstName} ${props.row.lastName}` : 'No changes' }}</q-tooltip>
                  </q-btn>
                  <q-btn
                    @click="viewUser(props.row)"
                    color="primary"
                    icon="person_search"
                    size="md"
                    round
                    flat
                  >
                    <q-tooltip>View {{ props.row.firstName }} {{ props.row.lastName }}'s profile</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="currentUserRole.includes(RoleEnum.Office)"
                    @click="deactivateUser(props.row)"
                    color="red"
                    icon="person_off"
                    size="md"
                    round
                    flat
                  >
                    <q-tooltip>Deactivate {{ props.row.firstName }} {{ props.row.lastName }}'s account</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom>
            <div class="row items-center justify-between full-width q-px-sm">
              <q-btn
              class="on right"
              @click="state.newUser = true"
              color="primary"
              icon="person_add"
              label="Add user"
            />
            <q-pagination
            v-model="pagination.page"
            :max="maxPages"
            boundary-numbers
            boundary-links
            direction-links
            outline
            color="primary"
            />
            </div>
            <q-dialog v-model="state.newUser" persistent>
              <q-card>
                <q-card-section>
                  <q-form ref="newUserForm" @submit.prevent="submitForm">
                    <b>Create new user</b>
                    <q-input
                      v-model="newUser.firstName"
                      :rules="[(val) => !!val || 'First name is required']"
                      label="First name"
                      lazy-rules
                    />
                    <q-input
                      v-model="newUser.lastName"
                      :rules="[(val) => !!val || 'Last name is required']"
                      label="Last name"
                      lazy-rules
                    />
                    <q-input
                      v-model="newUser.email"
                      :rules="[(val) => !!val || 'Email is required']"
                      label="Email"
                      lazy-rules
                    />
                    <q-select
                      v-model="newUser.role"
                      :options="Roles"
                      multiple
                      emit-value
                      map-options
                      fill-input
                      label="Roles"
                      use-chips
                      :rules="[(val) => !!val.length || 'At least one role is required']"
                      lazy-rules
                    />
                  </q-form>
                  <q-card-actions align="right">
                    <q-btn
                      color="red"
                      label="Cancel"
                      @click="state.newUser = false"
                    />
                    <q-btn color="primary" label="Add user" @click="submitForm" />
                  </q-card-actions>
                </q-card-section>
              </q-card>
            </q-dialog>
          </template>
        </q-table>
      </div>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { RoleEnum, LevelEnum, ExtendedUser } from 'src/db/types';
import { useUserStore } from 'src/stores/userStore';
import { useAdminStore } from 'src/stores/adminStore';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { getRoleColor, getLevelColor } from 'src/helpers/Color';
import { sortRoles, sortLevels } from 'src/helpers/FormatRole';

const userStore = useUserStore();
const adminStore = useAdminStore();
const router = useRouter();

const usersRef = ref<ExtendedUser[]>(userStore.users.map(user => ({
  ...user,
  role: user.role || [],
  level: user.level || [],
  isSenior: user.isSenior || false,
  isRoleChanged: false,
  isLevelChanged: false,
  isSeniorChanged: false,
  originalRoles: [...(user.role || [])],
  originalLevels: [...(user.level || [])],
  originalIsSenior: user.isSenior || false,
})));

const searchQuery = ref('');

const filteredUsersRef = computed(() => {
  if (!searchQuery.value) {
    return usersRef.value;
  }

  const query = searchQuery.value.toLowerCase();
  return usersRef.value.filter(user =>
    user.firstName.toLowerCase().includes(query) ||
    user.lastName.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role.some(role => role.toLowerCase().includes(query)) ||
    user.level.some(level => level.toLowerCase().includes(query))
  );
});

const filteredUsersCount = computed(() => filteredUsersRef.value.length);

const currentUserRole = computed(() => userStore.getUserRole());

const canEditSenior = computed(() => {
  const roles = currentUserRole.value;
  return roles.includes(RoleEnum.Office) || roles.includes(RoleEnum.Developer);
});

const columns: any[] = [
  { name: 'firstName', required: true, label: 'First name', align: 'left', field: 'firstName', sortable: true },
  { name: 'lastName', align: 'left', label: 'Last name', field: 'lastName', sortable: true },
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'role', align: 'left', label: 'Role', field: 'role', sortable: true },
  { name: 'level', align: 'left', label: 'Levels', field: 'level', sortable: true },
  { name: 'isSenior', align: 'left', label: 'Senior', field: 'isSenior', sortable: true },
  { name: 'Exams', align: 'left', label: 'Exams (S | I | E)', field: (row: ExtendedUser) => `${row._count.supervisedExams} | ${row._count.invigilatedExams} | ${row._count.examinedExams}`, sortable: true },
  { name: 'actions', align: 'left', label: 'Actions', field: 'actions' }
];

const Roles = computed(() => {
  return Object.entries(RoleEnum).map(([key, value]) => ({ label: value, value: key as RoleEnum }));
});

const Levels = computed(() => {
  return Object.entries(LevelEnum).map(([key, value]) => ({ label: value, value: key as LevelEnum }));
});

const viewUser = async (user: ExtendedUser) => {
  await nextTick();
  router.push(`/user/${user.id}`);
};

const state = reactive({
  newUser: false
});

const newUser = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: [] as RoleEnum[],
  level: [] as LevelEnum[],
  isSenior: false
});

const newUserForm = ref(null);

async function addUser() {
  await adminStore.registerUser(newUser.value.firstName, newUser.value.lastName, newUser.value.email, newUser.value.role);
  newUser.value = { firstName: '', lastName: '', email: '', role: [], level: [], isSenior: false };
  state.newUser = false;
  await userStore.getAllUsers();
  usersRef.value = userStore.users.map(user => ({
    ...user,
    role: user.role || [],
    level: user.level || [],
    isSenior: user.isSenior || false,
    isRoleChanged: false,
    isLevelChanged: false,
    isSeniorChanged: false,
    originalRoles: [...(user.role || [])],
    originalLevels: [...(user.level || [])],
    originalIsSenior: user.isSenior || false,
  }));
}

async function editUser(item: ExtendedUser) {
  const index = usersRef.value.indexOf(item);
  const updatedUser = { ...item };
  if (updatedUser.isRoleChanged) {
    await adminStore.updateUserRole(updatedUser.id, updatedUser.role);
  }
  if (updatedUser.isLevelChanged) {
    await adminStore.updateUserLevel(updatedUser.id, updatedUser.level);
  }
  if (updatedUser.isSeniorChanged) {
    await adminStore.updateUserIsSenior(updatedUser.id, updatedUser.isSenior);
  }
  usersRef.value[index] = updatedUser;
  updatedUser.isRoleChanged = false;
  updatedUser.isLevelChanged = false;
  updatedUser.isSeniorChanged = false;
  updatedUser.originalRoles = [...(updatedUser.role || [])];
  updatedUser.originalLevels = [...(updatedUser.level || [])];
  updatedUser.originalIsSenior = updatedUser.isSenior;
}

async function deactivateUser(user: ExtendedUser) {
  await adminStore.deactivateUser(user.id);
  await userStore.getAllUsers();
  usersRef.value = userStore.users.map(user => ({
    ...user,
    role: user.role || [],
    level: user.level || [],
    isSenior: user.isSenior || false,
    isRoleChanged: false,
    isLevelChanged: false,
    isSeniorChanged: false,
    originalRoles: [...(user.role || [])],
    originalLevels: [...(user.level || [])],
    originalIsSenior: user.isSenior || false,
  }));
}

const handleRoleChange = (user: ExtendedUser) => {
  user.isRoleChanged = !_.isEqual(user.originalRoles.sort(), user.role.sort());
};

const handleLevelChange = (user: ExtendedUser) => {
  user.isLevelChanged = !_.isEqual(user.originalLevels.sort(), user.level.sort());
};

const handleIsSeniorChange = (user: ExtendedUser) => {
  user.isSeniorChanged = user.originalIsSenior !== user.isSenior;
};

const toggleIsSenior = (user: ExtendedUser) => {
  user.isSenior = !user.isSenior;
  handleIsSeniorChange(user);
};

watch(usersRef, (newUsers) => {
  newUsers.forEach(newUser => {
    newUser.isRoleChanged = !_.isEqual(sortRoles(newUser.originalRoles), sortRoles(newUser.role));
    newUser.isLevelChanged = !_.isEqual(sortLevels(newUser.originalLevels), sortLevels(newUser.level));
    newUser.isSeniorChanged = newUser.originalIsSenior !== newUser.isSenior;
  });
}, { deep: true });

function submitForm() {
  const form = newUserForm.value as any;
  form.validate().then((valid: boolean) => {
    if (valid) {
      addUser();
    }
  }).catch((errors: any) => {
    console.error(errors);
  });
}

const pagination = ref({
  page: 1,
  rowsPerPage: 15,
});

const maxPages = computed(() => {
  return Math.ceil(filteredUsersCount.value / pagination.value.rowsPerPage);
});
</script>

<style scoped>
.q-table__container {
  border-radius: 8px;
  overflow: hidden;
}

.q-table thead tr:first-child th:first-child {
  border-top-left-radius: 8px;
}

.q-table thead tr:first-child th:last-child {
  border-top-right-radius: 8px;
}

.q-chip {
  font-size: 12px;
  height: 28px;
}

</style>
