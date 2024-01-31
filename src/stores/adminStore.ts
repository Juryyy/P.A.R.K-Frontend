import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { RoleEnum } from './db/types';
import { removeSpaces } from '../functions/RemoveSpaces';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: ref([]),
  }),
  actions: {
    async getAllUsers() {
      try {
        const response = await api.get('/office/allUsers');
        console.log(response.data);
        this.users = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting users',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },
    async updateUserRole(id: number, role: string) {
      try {
        const response = await api.post('/office/updateUserRole', {
          id,
          role,
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during updating user role',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },
    async registerUser(
      firstName: string,
      lastName: string,
      email: string,
      role: RoleEnum
    ) {
      try {
        // Backend does not accept spaces in role
        const Srole = removeSpaces(role.toString());
        email = removeSpaces(email);
        firstName = removeSpaces(firstName);
        lastName = removeSpaces(lastName);
        const response = await api.post('/office/registerUser', {
          firstName,
          lastName,
          email,
          Srole,
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during registering user',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },
  },
});
