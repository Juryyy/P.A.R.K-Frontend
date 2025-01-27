import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { User } from '../db/types';
import { Notify } from 'quasar';
import { useUserStore } from './userStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    verification : false as boolean,
    email : '' as string,
  }),
  actions: {
    async verifyUser(email : string, code : string){ {
      try {
        const response = await api.post('/auth/verify', { email, code });
        const token = await api.get('/auth/token');

        localStorage.setItem('token', token.data);
        const userStore = useUserStore();
        userStore.getUserInfo();

        Notify.create({
          color: 'positive',
          message: 'Verification successful',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: 'The code is not valid or has expired',
          position: 'bottom',
          icon: 'report_problem',
          });
        }
      }
    },
    async login(email: string, password: string) {
      try {
        const response = await api.post('/auth/login', { email, password });
        if(response.status === 200){
          this.verification = true;
          this.email = email;
        }
        Notify.create({
          color: 'positive',
          message: '2FA code sent to your email',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: 'Email and password do not match',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async logout() {
      try {
        const user = useUserStore().getUserInfo();
        if (!user) {
          return;
        }
        const response = await api.delete('/auth/logout');
        if (response.status === 200) {
          localStorage.clear();
        } else {
          throw new Error('Logout failed');
        }
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async registerUser(email: string, firstName: string, lastName: string, role: string) {
      try {
        const response = await api.post('/office/registerUser', {
          email,
          firstName,
          lastName,
          role,
        });
        Notify.create({
          color: 'positive',
          message: 'User registered',
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

    async resetPassword(email: string) {
      try {
        await api.post('/auth/password-reset', { email });
        Notify.create({
          color: 'positive',
          message: 'Password reset email sent',
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

    async updatePassword(password: string, newPassword: string) {
      try {
        await api.post('/auth/password-update', { password, newPassword });
        Notify.create({
          color: 'positive',
          message: 'Password updated',
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

    async getToken() {
      try {
        const response = await api.get('/auth/token');
        localStorage.removeItem('token');
        localStorage.setItem('token', response.data);
        const userStore = useUserStore();
        userStore.getUserInfo();
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    }

  },
});
