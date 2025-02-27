import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { CentreEnum, RoleEnum } from '../db/types';
import { removeSpaces } from '../helpers/RemoveSpaces';
import { Location } from 'src/db/types';

export interface AdminResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useAdminStore = defineStore('admin', {
  state: () => ({
    locationsWithVenues: ref([] as Location[]),
  }),
  actions: {
    async updateUserRole(id: number, role: string[]): Promise<AdminResult> {
      try {
        role = role.map((r) => removeSpaces(r));
        const response = await api.post('/office/updateUserRole', {
          id,
          role,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update user role'
        };
      }
    },

    async registerUser(
      firstName: string,
      lastName: string,
      email: string,
      role: RoleEnum[],
      centre: CentreEnum[]
    ): Promise<AdminResult> {
      try {
        const response = await api.post('/office/registerUser', {
          firstName,
          lastName,
          email,
          role,
          centre
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to register user'
        };
      }
    },

    async getLocationsWithVenues(): Promise<AdminResult> {
      try {
        const response = await api.get('/office/locationsWithVenues');
        this.locationsWithVenues = response.data as Location[];
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get locations with venues'
        };
      }
    },

    async deactivateUser(id: number): Promise<AdminResult> {
      try {
        const response = await api.put(`/office/deactivateUser/${id}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to deactivate user'
        };
      }
    },

    async updateUserAdminCentre(id: number, adminCentre: CentreEnum[]): Promise<AdminResult> {
      try {
        const response = await api.put('/office/updateUserCentre', {
          id,
          adminCentre,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update user centre'
        };
      }
    },

    async addLocation(location: string, adminCentre: CentreEnum[]): Promise<AdminResult> {
      try {
        const response = await api.post('/office/addLocation', {
          location,
          adminCentre
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add location'
        };
      }
    },

    async addVenue(location: number, venue: string, link: string): Promise<AdminResult> {
      try {
        const response = await api.post('/office/addVenue', {
          location,
          venue,
          link
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add venue'
        };
      }
    },

    async removeLocation(location: number): Promise<AdminResult> {
      try {
        const response = await api.delete(`/office/deleteLocation/${location}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to remove location'
        };
      }
    },

    async removeVenue(venue: number): Promise<AdminResult> {
      try {
        const response = await api.delete(`/office/deleteVenue/${venue}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to remove venue'
        };
      }
    },

    async updateUserLevel(id: number, level: string[]): Promise<AdminResult> {
      try {
        const response = await api.post('/office/updateUserLevel', {
          id,
          level,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update user level'
        };
      }
    },

    async updateUserIsSenior(id: number, isSenior: boolean): Promise<AdminResult> {
      try {
        const response = await api.post('/office/updateUserSenior', {
          id,
          isSenior,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update user senior status'
        };
      }
    },
  },
});
