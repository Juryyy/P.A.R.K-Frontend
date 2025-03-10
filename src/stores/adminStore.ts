import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { RoleEnum } from '../db/types';
import { removeSpaces } from '../helpers/RemoveSpaces';
import { Location } from 'src/db/types';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    locationsWithVenues: ref([] as Location[]),
  }),
  actions: {
    async updateUserRole(id: number, role: string[]) {
      try {
        role = role.map((r) => removeSpaces(r));
        const response = await api.post('/office/updateUserRole', {
          id,
          role,
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },
    async registerUser(
      firstName: string,
      lastName: string,
      email: string,
      role: RoleEnum[]
    ) {
      try {
        // Backend does not accept spaces in role
        const response = await api.post('/office/registerUser', {
          firstName,
          lastName,
          email,
          role,
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async getLocationsWithVenues(){
      try {
        const response = await api.get('/office/locationsWithVenues');
        this.locationsWithVenues = response.data as Location[];
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async deactivateUser(id: number) {
      // Deactivate user
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
          textColor: 'black',
        });
      }
      catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async addVenue(location: number, venue: string, link: string){
      try {
        const response = await api.post('/office/addVenue', {
          location,
          venue,
          link
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      }
      catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async removeLocation(location: number){
      try {
        const response = await api.delete(`/office/deleteLocation/${location}`);
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      }
      catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
          textColor: 'black',
        });
      }
    },

    async removeVenue(venue: number){
      try {
        const response = await api.delete(`/office/deleteVenue/${venue}`);
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      }
      catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
          textColor: 'black',
        });
      }
    },

    async updateUserLevel(id: number, level: string[]) {
      try {
        const response = await api.post('/office/updateUserLevel', {
          id,
          level,
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async updateUserIsSenior(id: number, isSenior: boolean) {
      try {
        const response = await api.post('/office/updateUserSenior', {
          id,
          isSenior,
        });
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },
  },
});
