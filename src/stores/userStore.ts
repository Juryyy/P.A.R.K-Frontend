import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { UserInfo } from './db/types';
import { ref } from 'vue';
import { Notify } from 'quasar';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: ref({} as UserInfo),
    usersExams: ref([]),
    userAvatar: ref(''),
  }),
  actions: {
    getUserInfo() {
      const user = {} as UserInfo;
      user.id = Number(localStorage.getItem('id'));
      user.email = localStorage.getItem('email');
      user.firstName = localStorage.getItem('firstName');
      user.lastName = localStorage.getItem('lastName');
      user.drivingLicense = Boolean(localStorage.getItem('drivingLicense'));
      user.note = localStorage.getItem('note');
      user.adminNote = localStorage.getItem('adminNote');
      user.role = localStorage.getItem('role');
      user.avatarUrl = localStorage.getItem('avatarUrl');
      user.activatedAccount = Boolean(localStorage.getItem('activatedAccount'));
      user.deactivated = Boolean(localStorage.getItem('deactivated'));
      this.user = user;
      return this.user;
    },

    getUserRole() {
      return localStorage.getItem('role');
    },

    getUserId() {
      return localStorage.getItem('id');
    },

    async getUsersExams() {
      try {
        const response = await api.get('/users/usersExams');
        this.usersExams = response.data;
      } catch (error) {
        Notify.create({
          message: 'Error getting users exams',
          color: 'red',
          icon: 'report_problem',
          position: 'top',
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
      } catch (error) {
        Notify.create({
          message: 'Error loading avatar',
          color: 'red',
          icon: 'report_problem',
          position: 'top',
        });
      }
    },

    async updateUserInfo(userInfo: UserInfo) {
      //add update user info on backend
      this.user = userInfo;
      for (const [key, value] of Object.entries(userInfo)) {
        localStorage.set(key, value);
      }
    },
  },
});
