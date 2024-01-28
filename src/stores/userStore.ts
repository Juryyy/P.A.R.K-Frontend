import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { UserInfo  }  from './db/types';
import { ref } from 'vue';
import { Notify } from 'quasar';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: ref({} as UserInfo),
    usersExams: ref([]),
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

    getUserRole(){
      return localStorage.getItem('role');
    },

    getUserId(){
      return localStorage.getItem('id');
    },

    async getUsersExams (){
      try {
        await api.get('/exams/usersExams').then((response) => {
          this.usersExams = response.data;
        });
      } catch (error) {
        Notify.create('Error getting exams');
      }
    },

    async updateUserInfo(userInfo : UserInfo) {
      //add update user info on backend
      this.user = userInfo;
      for (const [key, value] of Object.entries(userInfo)) {
        localStorage.set(key, value);
      }
    }
  }
});
