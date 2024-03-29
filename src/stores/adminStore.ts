import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { RoleEnum } from './db/types';
import { removeSpaces } from '../functions/RemoveSpaces';
import { Location } from 'src/stores/db/types';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    locationsWithVenues: ref([] as Location[]),
  }),
  actions: {
    async updateUserRole(id: number, role: string) {
      try {
        role = removeSpaces(role.toString());
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

    async getLocationsWithVenues(){
      try {
        const response = await api.get('/office/locationsWithVenues');
        console.log(response.data);
        this.locationsWithVenues = response.data as Location[];
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting locations with venues',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async addLocation(location: string){
      try {
        const response = await api.post('/office/addLocation', {
          location
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
        });
      }
      catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during adding location',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async addVenue(location: number, venue: string){
      try {
        const response = await api.post('/office/addVenue', {
          location,
          venue
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
        });
      }
      catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during adding venue',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    }

  },
});
