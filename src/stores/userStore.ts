// src/stores/userStore.ts
import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { UserInfo, User } from '../db/types';
import { ref } from 'vue';
import { jwtDecode } from 'jwt-decode';

export interface UserResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: ref({} as UserInfo),
    usersExams: ref([]),
    userAvatar: ref(''),
    selectedUser: ref({} as User),
    selectedUserAvatar: ref(''),
    users: ref([] as User[]),
    refreshTrigger: ref(0),
    lastRefreshTime: ref(0),
    updateConfirmation: ref(false),
    isActivated: ref(false),
    rightDrawerOpen: ref(true),
  }),
  actions: {
    triggerExamRefresh() {
      this.refreshTrigger += 1;
    },

    setUserAvatar(newAvatarUrl: string) {
      this.userAvatar = newAvatarUrl;
    },

    getUserInfo() {
      const token = localStorage.getItem('token');
      if (token) {
        const decode = jwtDecode(token) as UserInfo;
        Object.assign(this.user, decode.user);
      }
      return this.user;
    },

    getUserRole() {
      const roles = this.user.role;
      return roles;
    },

    getUserId() {
      return this.user.id;
    },

    async refreshUserInfo(): Promise<UserResult> {
      try {
        this.getUserInfo();
        this.user = { ...this.user };
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Failed to refresh user information'
        };
      }
    },

    async getUsersExams(): Promise<UserResult> {
      try {
        const currentTime = Date.now();
        if (currentTime - this.lastRefreshTime < 100) {
          return { success: true, data: this.usersExams };
        }
        this.lastRefreshTime = currentTime;
        const response = await api.get('/users/usersExams');
        this.usersExams = response.data;
        this.triggerExamRefresh()
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get user exams'
        };
      }
    },

    async getUsersAvatar(): Promise<UserResult> {
      try {
        const response = await api.get('static/images/avatar', {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'image/jpeg',
          },
        });
        const uint8Array = new Uint8Array(response.data);
        const arrayBuffer = uint8Array.buffer;
        const array = Array.from(new Uint8Array(arrayBuffer));
        const base64String = btoa(String.fromCharCode.apply(null, array));

        this.userAvatar = `data:image/jpeg;base64,${base64String}`;
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get user avatar'
        };
      }
    },

    async getProfile(userId: number): Promise<UserResult> {
      try {
        const response = await api.get(`/users/profile/${userId}`);
        this.selectedUser = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get user profile'
        };
      }
    },

    async getUserAvatarById(userId: number): Promise<UserResult> {
      try {
        const response = await api.get(`static/images/${userId}`, {
          responseType: 'arraybuffer',
          headers: {
            Accept: 'image/jpeg',
          },
        });
        const uint8Array = new Uint8Array(response.data);
        const arrayBuffer = uint8Array.buffer;
        const array = Array.from(new Uint8Array(arrayBuffer));
        const base64String = btoa(String.fromCharCode.apply(null, array));

        this.selectedUserAvatar = `data:image/jpeg;base64,${base64String}`;
        const avatarUrl = `data:${response.headers['content-type']};base64,${base64String}`;
        if (userId === this.user.id) {
          this.setUserAvatar(avatarUrl);
        }
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get user avatar by ID'
        };
      }
    },

    async getAllUsers(): Promise<UserResult> {
      try {
        const response = await api.get('/users/allUsers');
        this.users = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get all users'
        };
      }
    },

    async updateProfile(
      id: number,
      email: string,
      firstName: string,
      lastName: string,
      dateOfBirth: string,
      note: string | null,
      noteLonger: string | null,
      drivingLicense: boolean,
      phone: string | null,
      totaraDate: string | undefined,
      totaraDone: boolean,
      insperaAccount: boolean
    ): Promise<UserResult> {
      try {
        const response = await api.put('/users/update', {
          id,
          email,
          firstName,
          lastName,
          dateOfBirth,
          note,
          noteLonger,
          drivingLicense,
          phone,
          totaraDate,
          totaraDone,
          insperaAccount,
        });
        this.updateConfirmation = true;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update profile'
        };
      }
    },

    async updateAdminNote(id: number, adminNote: string | null): Promise<UserResult> {
      try {
        const response = await api.put('/users/updateAdminNote', {
          id,
          adminNote,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update admin note'
        };
      }
    },

    async uploadAvatar(file: File): Promise<UserResult> {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await api.post('/users/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to upload avatar'
        };
      }
    },

    async updateInsperaAccount(id: number, insperaAccount: boolean): Promise<UserResult> {
      try {
        const response = await api.put('/users/updateInspera', {
          id,
          insperaAccount,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update inspera account'
        };
      }
    },

    clearSelectedUserInfo() {
      this.selectedUser = {} as User;
      this.selectedUserAvatar = '';
    },

    changeConfirmation(bool: boolean) {
      this.updateConfirmation = bool;
    },

    updatePasswordStatus() {
      this.user.passwordUpdated = true;
    },

    toggleRightDrawer() {
      this.rightDrawerOpen = !this.rightDrawerOpen;
    },
  }
});
