import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { User }  from './db/Backend';
import { Cookies } from 'quasar';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
  }),
  actions: {
    getUserInfo() {
        const user = {} as User;
        user.id = Number(Cookies.get('id'));
        user.email = Cookies.get('email');
        user.firstName = Cookies.get('firstName');
        user.lastName = Cookies.get('lastName');
        user.drivingLicense = Boolean(Cookies.get('drivingLicense'));
        user.note = Cookies.get('note');
        user.adminNote = Cookies.get('adminNote');
        user.role = Cookies.get('role');
        user.avatarUrl = Cookies.get('avatarUrl');
        user.activatedAccount = Boolean(Cookies.get('activatedAccount'));
        user.deactivated = Boolean(Cookies.get('deactivated'));
        this.user = user;
      return this.user;
    },

    getUserRole(){
      return Cookies.get('role');
    },

    getUserId(){
      return Cookies.get('id');
    },

    async updateUserInfo(userInfo : User) {
      //add update user info on backend
      this.user = userInfo;
      for (const [key, value] of Object.entries(userInfo)) {
        Cookies.set(key, value);
      }
    }
  }
});
