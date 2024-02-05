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
                {{ props.row.role }}
                <q-popup-edit v-model="props.row.role"
                :disable="currentUserRole !== 'Office'">
                  <q-select
                    v-model="props.row.role"
                    :options="Roles"
                    emit-value
                    map-options
                    dense
                    fill-input
                    use-input
                    hide-selected
                    @update:modelValue="handleRoleChange(props.row, true)"
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
import { useAdminStore } from 'src/stores/adminStore';
import { computed, reactive, ref, Ref, watch} from 'vue';
import { User, RoleEnum } from 'src/stores/db/types';
import { router } from 'src/router/index';
import { useUserStore } from 'src/stores/userStore';

const adminStore = useAdminStore();
const userStore = useUserStore();

const users: User[] = userStore.users;
const usersRef: Ref<User[]> = ref(users);
const currentUserRole = userStore.getUserRole();

console.log(currentUserRole)

const columns = [
  {
    name: 'firstName',
    required: true,
    label: 'First name',
    align: 'left',
    field: 'firstName',
    sortable: true,
  },
  {
    name: 'lastName',
    align: 'left',
    label: 'Last name',
    field: 'lastName',
    sortable: true,
  },
  {
    name: 'email',
    align: 'left',
    label: 'Email',
    field: 'email',
    sortable: true,
  },
  { name: 'role', align: 'left', label: 'Role', field: 'role', sortable: true },
  {
    name: 'Exams',
    align: 'left',
    label: 'Exams (S | I | E)',
    field: 'Exams',
    sortable: true,
  },
  { name: 'actions', align: 'left', label: 'Actions', field: 'actions' },
] as {
  name: string;
  required: boolean;
  label: string;
  align: 'left';
  field: string | ((row: User) => User);
  sortable: boolean;
}[];

async function addUser() {
  await adminStore.registerUser(
    newUser.value.firstName,
    newUser.value.lastName,
    newUser.value.email,
    newUser.value.role
  );
  state.newUser = false;
  await userStore.getAllUsers();
  usersRef.value = userStore.users;
}

async function deactivateUser(user: User) {
  console.log('deactivate', user.id);
}

const editedItem = ref({} as User);
const editedIndex = ref(-1);

const editUser = async (item: User) => {
  editedIndex.value = usersRef.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  editedItem.value.isRoleChanged = false;
  await adminStore.updateUserRole(editedItem.value.id, editedItem.value.role);
  handleRoleChange(editedItem.value, false);
  usersRef.value[editedIndex.value] = editedItem.value;
};

const viewUser = (item: User) => {
  router.push(`/users/${item.id}`);
};

const Roles = computed(() => {
  return Object.values(RoleEnum).map((role) => {
    return { label: role, value: role };
  });
});

const state = reactive({
  newUser: false,
  passwordHidden: true,
});

const newUser = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: RoleEnum.Invigilator,
});


watch(usersRef, (newUsers, oldUsers) => {
  newUsers.forEach((newUser, index) => {
    if (newUser.role !== oldUsers[index].role) {
      usersRef.value[index].isRoleChanged = true;
    }
  });
}, { deep: true });

const handleRoleChange = (user: User, change : boolean) => {
  user.isRoleChanged = change;
};
</script>
