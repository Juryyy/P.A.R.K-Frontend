<template>
  <q-page>
    <q-table>
      <template v-slot:top>
        <q-btn @click="addUser" color="amber" label="Add User" icon="add" />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name">
            {{ props.row.name }}
          </q-td>
          <q-td key="email">
            {{ props.row.email }}
          </q-td>
          <q-td key="role">
            {{ props.row.role }}
          </q-td>
          <q-td key="actions">
            <q-btn @click="editUser(props.row)" color="amber" label="Edit" icon="edit" />
            <q-btn @click="deleteUser(props.row)" color="amber" label="Delete" icon="delete" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>
<script setup lang="ts">
import { useAdminStore } from 'src/stores/adminStore';
import { useUserStore } from 'src/stores/userStore';
import { computed, onBeforeMount, ref } from 'vue';
import { Loading } from 'quasar';
import { router } from 'src/router/index';
import { User } from 'src/stores/db/types';

const adminStore = useAdminStore();
const userStore = useUserStore();

const users =  adminStore.users;
const usersRef = ref(users)

const columns = [
  {
    name: 'fname',
    required: true,
    label: 'First name',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  { name: 'lname', align: 'left', label: 'Last name', field: 'name', sortable: true},
  { name: 'email', align: 'left', label: 'Email', field: 'email', sortable: true },
  { name: 'role', align: 'left', label: 'Role', field: 'role', sortable: true },
  { name: 'actions', align: 'left', label: 'Actions', field: 'actions' },
];



</script>
