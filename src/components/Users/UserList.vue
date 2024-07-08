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
              <q-td key="firstName">
                {{ props.row.firstName }}
              </q-td>
              <q-td key="lastName">
                {{ props.row.lastName }}
              </q-td>
              <q-td key="email">
                {{ props.row.email }}
              </q-td>
              <q-td key="role">
                {{ props.row.role.join(', ') }}
                <q-popup-edit v-model="props.row.role"
                :disable="currentUserRole.includes(RoleEnum.Office)">
                  <q-select
                    v-model="props.row.role"
                    :options="Roles"
                    multiple
                    emit-value
                    map-options
                    dense
                    fill-input
                    use-input
                    hide-selected
                    @update:modelValue="handleRoleChange(props.row, props.row.role)"
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
                  <q-btn v-if="currentUserRole === 'Office'"
                    @click="editUser(props.row)"
                    :color="props.row.isRoleChanged ? 'blue' : 'grey'"
                    icon="manage_accounts"
                    :disable="!props.row.isRoleChanged"
                  >
                    <q-tooltip v-if="props.row.isRoleChanged" class="bg-blue" :delay="250" >Update users role</q-tooltip>
                    <q-tooltip v-else class="bg-grey" :delay="250">No changes to users role</q-tooltip>
                  </q-btn>
                  <q-btn
                    @click="viewUser(props.row)"
                    color="primary"
                    icon="person_search"
                  >
                    <q-tooltip class="bg-primary" :delay="250"
                      >View users profile</q-tooltip
                    >
                  </q-btn>
                  <q-btn v-if="currentUserRole === 'Office'"
                    @click="deactivateUser(props.row)"
                    color="red"
                    icon="person_off"
                  >
                    <q-tooltip class="bg-red" :delay="250"
                      >Deactivate user</q-tooltip
                    >
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
import { User, RoleEnum } from 'src/stores/db/types';
import { useUserStore } from 'src/stores/userStore';
import { useAdminStore } from 'src/stores/adminStore';
import { router } from 'src/router';

const userStore = useUserStore();
const adminStore = useAdminStore();

const usersRef = ref<User[]>(userStore.users);
const currentUserRole = computed(() => userStore.getUserRole());

const columns: any[] = [
  { name: 'firstName', required: true, label: 'First name', align: 'left', field: 'firstName', sortable: true },
  { name: 'lastName', align: 'left', label: 'Last name', field: 'lastName', sortable: true },
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'role', align: 'left', label: 'Role', field: 'role', sortable: true },
  { name: 'Exams', align: 'left', label: 'Exams (S | I | E)', field: (row: User) => `${row._count.supervisedExams} | ${row._count.invigilatedExams} | ${row._count.examinedExams}`, sortable: true },
  { name: 'actions', align: 'left', label: 'Actions', field: 'actions' }
];

const Roles = computed(() => {
  return Object.values(RoleEnum).map(role => ({ label: role, value: role }));
});

const viewUser = async (user: User) => {
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
  usersRef.value = userStore.users;
}

async function editUser(item: User) {
  const index = usersRef.value.indexOf(item);
  const updatedUser = { ...item };
  await adminStore.updateUserRole(updatedUser.id, updatedUser.role);
  usersRef.value[index] = updatedUser;
}

async function deactivateUser(user: User) {
  await adminStore.deactivateUser(user.id);
  await userStore.getAllUsers();
  usersRef.value = userStore.users;
}

const handleRoleChange = (user: User, newValue: RoleEnum[]) => {
  const originalRoles = usersRef.value.find(u => u.id === user.id)?.role || [];
  if (JSON.stringify(originalRoles) !== JSON.stringify(newValue)) {
    user.isRoleChanged = true;
  } else {
    user.isRoleChanged = false;
  }
};

watch(usersRef, (newUsers, oldUsers) => {
  newUsers.forEach((newUser, index) => {
    if (JSON.stringify(newUser.role) !== JSON.stringify(oldUsers[index].role)) {
      newUser.isRoleChanged = true;
    }
  });
}, { deep: true });

</script>
