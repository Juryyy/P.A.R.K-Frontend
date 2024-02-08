import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { User } from './db/types';
import { Notify } from 'quasar';
import { useUserStore } from './userStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: undefined as User | undefined,
  }),
  actions: {
    setUserInfo(userInfo: User) {
      this.user = userInfo;
      for (const [key, value] of Object.entries(userInfo)) {
        //encode the value to a string
        localStorage.setItem(key, value);
      }
    },

    async login(email: string, password: string) {
      try {
        const response = await api.post('/auth/login', { email, password });
        const userInfo = response.data as User;
        this.setUserInfo(userInfo);
        Notify.create({
          color: 'positive',
          message: 'Login successful',
          position: 'top',
          icon: 'check',
        });
      } catch (error) {
        console.error('Error during login:', error);
        Notify.create({
          color: 'negative',
          message: 'Error during login',
          position: 'top',
          icon: 'report_problem',
        });
      }
    },

    async logout() {
      try {
        const user = useUserStore().getUserInfo();
        if (!user) {
          Notify.create({
            color: 'negative',
            message: 'Error during logout',
            position: 'top',
            icon: 'report_problem',
          });
          return;
        }
        const response = await api.delete('/auth/logout');
        if (response.status === 200) {
          for (const [key] of Object.entries(user)) {
            localStorage.removeItem(key);
          }
          this.user = undefined;
        }
        Notify.create({
          color: 'positive',
          message: 'Successfully logged out',
          position: 'top',
          icon: 'report_problem',
        });
      } catch (error) {
        console.error('Error during logout:', error);
        Notify.create({
          color: 'negative',
          message: 'Error during logout',
          position: 'top',
          icon: 'report_problem',
        });
      }
    },

    async registerUser(
      email: string,
      firstName: string,
      lastName: string,
      role: string
    ) {
      try {
        await api.post('/office/registerUser', {
          email,
          firstName,
          lastName,
          role,
        });
        Notify.create({
          color: 'positive',
          message: 'User registered',
          position: 'top',
          icon: 'check',
        });
      } catch (error) {
        console.error('Error during registration:', error);
        Notify.create({
          color: 'negative',
          message: 'Error during registration',
          position: 'top',
          icon: 'report_problem',
        });
      }
    },
  },
});
