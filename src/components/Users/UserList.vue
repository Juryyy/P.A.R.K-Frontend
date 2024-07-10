<template>
  <div id="q-app">
    <div class="q-pa-sm q-gutter-sm">
      <q-page>
        <q-table
          class="primary-header"
          flat
          bordered
          title="Users"
          :rows="usersRef"
          :columns="columns"
        >
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="firstName">{{ props.row.firstName }}</q-td>
              <q-td key="lastName">{{ props.row.lastName }}</q-td>
              <q-td key="email">{{ props.row.email }}</q-td>
              <q-td key="role">
                <div>
                  <q-chip
                    v-for="role in sortRoles(props.row.role)"
                    :key="role"
                    :color="getRoleColor(role)"
                    class="q-mr-sm q-mb-sm"
                  >
                    {{ formatRole(role) }}
                  </q-chip>
                </div>
                <q-popup-edit
                  v-model="props.row.role"
                  :disable="!currentUserRole.includes(RoleEnum.Office)"
                >
                  <q-select
                    v-model="props.row.role"
                    :options="Roles"
                    multiple
                    emit-value
                    map-options
                    dense
                    fill-input
                    use-input
                    use-chips
                    @update:modelValue="handleRoleChange(props.row)"
                  />
                </q-popup-edit>
              </q-td>
              <q-td key="Exams">
                {{
                  props.row._count.supervisedExams +
                  ' | ' +
                  props.row._count.invigilatedExams +
                  ' | ' +
                  props.row._count.examinedExams
                }}
              </q-td>
              <q-td key="actions">
                <q-btn-group>
                  <q-btn
                    v-if="currentUserRole.includes(RoleEnum.Office)"
                    @click="editUser(props.row)"
                    :color="props.row.isRoleChanged ? 'blue' : 'grey'"
                    icon="manage_accounts"
                    :disable="!props.row.isRoleChanged"
                  >
                    <q-tooltip v-if="props.row.isRoleChanged" class="bg-blue" :delay="250">
                      Update user's role
                    </q-tooltip>
                    <q-tooltip v-else class="bg-grey" :delay="250">
                      No changes to user's role
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    @click="viewUser(props.row)"
                    color="primary"
                    icon="person_search"
                  >
                    <q-tooltip class="bg-primary" :delay="250">
                      View user's profile
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="currentUserRole.includes(RoleEnum.Office)"
                    @click="deactivateUser(props.row)"
                    color="red"
                    icon="person_off"
                  >
                    <q-tooltip class="bg-red" :delay="250">
                      Deactivate user
                    </q-tooltip>
                  </q-btn>
                </q-btn-group>
              </q-td>
            </q-tr>
          </template>
          <template v-slot:bottom>
            <q-btn
              class="on right"
              @click="state.newUser = true"
              color="primary"
              icon="person_add"
            />
            <q-dialog v-model="state.newUser" persistent>
              <q-card>
                <q-card-section>
                  <q-form>
                    <b>Create new user</b>
                    <q-input v-model="newUser.firstName" label="First name" />
                    <q-input v-model="newUser.lastName" label="Last name" />
                    <q-input v-model="newUser.email" label="Email" />
                    <q-select
                      v-model="newUser.role"
                      :options="Roles"
                      multiple
                      emit-value
                      map-options
                      dense
                      fill-input
                      use-input
                      hide-selected
                    />
                  </q-form>
                  <q-card-actions align="right">
                    <q-btn
                      color="red"
                      label="Cancel"
                      @click="state.newUser = false"
                    />
                    <q-btn color="primary" @click="addUser" label="Add user" />
                  </q-card-actions>
                </q-card-section>
              </q-card>
            </q-dialog>
          </template>
        </q-table>
      </q-page>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { User, RoleEnum, ExtendedUser } from 'src/stores/db/types';
import { useUserStore } from 'src/stores/userStore';
import { useAdminStore } from 'src/stores/adminStore';
import { router } from 'src/router';
import _ from 'lodash';
import { getRoleColor } from 'src/helpers/RoleColor';
import { sortRoles } from 'src/helpers/FormatRole';

const userStore = useUserStore();
const adminStore = useAdminStore();

const formatRole = (role: string): string => {
  switch (role) {
    case 'Office':
      return 'Office';
    case 'Supervisor':
      return 'Supervisor';
    case 'Invigilator':
      return 'Invigilator';
    case 'Technician':
      return 'Technician';
    case 'Examiner':
      return 'Examiner';
    default:
      return role;
  }
};


const usersRef = ref<ExtendedUser[]>(userStore.users.map(user => ({
  ...user,
  role: user.role,
  isRoleChanged: false,
  originalRoles: [...user.role]
})));

const currentUserRole = computed(() => userStore.getUserRole());

const columns: any[] = [
  { name: 'firstName', required: true, label: 'First name', align: 'left', field: 'firstName', sortable: true },
  { name: 'lastName', align: 'left', label: 'Last name', field: 'lastName', sortable: true },
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'role', align: 'left', label: 'Role', field: 'role', sortable: true },
  { name: 'Exams', align: 'left', label: 'Exams (S | I | E)', field: (row: ExtendedUser) => `${row._count.supervisedExams} | ${row._count.invigilatedExams} | ${row._count.examinedExams}`, sortable: true },
  { name: 'actions', align: 'left', label: 'Actions', field: 'actions' }
];

const Roles = computed(() => {
  return Object.entries(RoleEnum).map(([key, value]) => ({ label: value, value: key as RoleEnum }));
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
  role: [] as RoleEnum[]
});

async function addUser() {
  await adminStore.registerUser(newUser.value.firstName, newUser.value.lastName, newUser.value.email, newUser.value.role);
  state.newUser = false;
  await userStore.getAllUsers();
  usersRef.value = userStore.users.map(user => ({
    ...user,
    role: user.role,
    isRoleChanged: false,
    originalRoles: [...user.role]
  }));
}

async function editUser(item: ExtendedUser) {
  const index = usersRef.value.indexOf(item);
  const updatedUser = { ...item };
  await adminStore.updateUserRole(updatedUser.id, updatedUser.role);
  usersRef.value[index] = updatedUser;
  updatedUser.isRoleChanged = false;
  updatedUser.originalRoles = [...updatedUser.role];
}

async function deactivateUser(user: ExtendedUser) {
  await adminStore.deactivateUser(user.id);
  await userStore.getAllUsers();
  usersRef.value = userStore.users.map(user => ({
    ...user,
    role: user.role,
    isRoleChanged: false,
    originalRoles: [...user.role]
  }));
}

const handleRoleChange = (user: ExtendedUser) => {
  user.isRoleChanged = !_.isEqual(user.originalRoles.sort(), user.role.sort());
};

watch(usersRef, (newUsers) => {
  newUsers.forEach(newUser => {
    newUser.isRoleChanged = !_.isEqual(sortRoles(newUser.originalRoles), sortRoles(newUser.role));
  });
}, { deep: true });
</script>

<style lang="scss" scoped>
.drawer-avatar-box {
  display: flex;
  align-items: center;
  text-align: left;
}

.drawer-avatar-box .column {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.drawer-avatar-box .row {
  display: flex;
  align-items: center;
}

.drawer-avatar-box .text-weight-bold {
  margin-bottom: 4px;
}

.card {
  background-color: $primary;
}

.user-info {
  display: flex;
  align-items: center;
}
</style>
