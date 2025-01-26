import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { UserInfo, User } from '../db/types';
import { ref } from 'vue';
import { Notify } from 'quasar';
import { jwtDecode } from 'jwt-decode';


export const useUserStore = defineStore('user', {
  state: () => ({
    user: ref({} as UserInfo),
    usersExams: ref([]),
    userAvatar: ref(''),
    selectedUser: ref({} as User),
    selectedUserAvatar: ref(''),
    users : ref([] as User[]),
    refreshTrigger: ref(0),
    lastRefreshTime: ref(0),
    updateConfirmation: ref(false),
    isActivated: ref(false)
  }),
  actions: {
    triggerExamRefresh(){
      this.refreshTrigger+=1;
    },

    setUserAvatar(newAvatarUrl: string) {
      this.userAvatar = newAvatarUrl;
    },

    getUserInfo() {
      // Decode jwt token from local storage and set user info
      const token = localStorage.getItem('token');
      if (token) {
        const decode = jwtDecode(token) as UserInfo;
        this.user = decode.user;
      }
      return this.user;
    },

    getUserRole() {
      const roles = this.user.roles;
      return roles ? JSON.parse(roles) : [];
    },

    getUserId() {
      return this.user.id;
    },

    async getUsersExams() {
      try {
        const currentTime = Date.now();
        if (currentTime - this.lastRefreshTime < 100) {
          return this.usersExams;
        }
        this.lastRefreshTime = currentTime;
        const response = await api.get('/users/usersExams');
        this.usersExams = response.data;
        this.triggerExamRefresh()
      } catch (error : any) {
        Notify.create({
          message: error.response.data.error,
          color: 'red',
          icon: 'report_problem',
          position: 'bottom',
        });
      }
    },

    async getUsersAvatar() {
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
      } catch (error : any) {
        Notify.create({
          message: error.response.data.error,
          color: 'red',
          icon: 'report_problem',
          position: 'bottom',
        });
      }
    },

    async getProfile(userId: number) {
      try {
        const response = await api.get(`/users/profile/${userId}`);
        this.selectedUser = response.data;
      } catch (error : any) {
        Notify.create({
          message: error.response.data.error,
          color: 'red',
          icon: 'report_problem',
          position: 'bottom',
        });
      }
    },

    async getUserAvatarById(userId: number) {
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
      } catch (error : any) {
        Notify.create({
          message: error.response.data.error,
          color: 'red',
          icon: 'report_problem',
          position: 'bottom',
        });
      }
    },

    async getAllUsers() {
      try {
        const response = await api.get('/users/allUsers');
        this.users = response.data;
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async updateProfile(id: number, email: string, firstName: string, lastName: string, dateOfBirth : string, note : string | null, noteLonger : string | null, drivingLicense : boolean, phone : string | null, totaraDate: string | undefined, totaraDone: boolean, insperaAccount: boolean) {
      try {
      await api.put('/users/update', {
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
      Notify.create({
        color: 'positive',
        message: 'Profile updated',
        position: 'bottom',
        icon: 'check',
        closeBtn: 'X',
        textColor: 'black',
      });
      this.updateConfirmation = true;
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

   async updateAdminNote (id: number, adminNote: string | null) {
    try {
      await api.put('/users/updateAdminNote', {
        id,
        adminNote,
      });
      Notify.create({
        color: 'positive',
        message: 'Admin note updated',
        position: 'bottom',
        icon: 'check',
        closeBtn: 'X',
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

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await api.post('/users/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      await this.getUsersAvatar();
      Notify.create({
        color: 'positive',
        message: 'Avatar updated',
        position: 'bottom',
        icon: 'check',
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

  async updateInsperaAccount(id: number, insperaAccount: boolean) {
    try {
      await api.put('/users/updateInspera', {
        id,
        insperaAccount,
      });
      Notify.create({
        color: 'positive',
        message: 'Inspera account updated',
        position: 'bottom',
        icon: 'check',
        closeBtn: 'X',
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
  }

});
