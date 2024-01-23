import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { User }  from './db/types';
import { Cookies } from 'quasar';
import { Notify } from 'quasar';
import { useUserStore } from './userStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: undefined as User | undefined
  }),
  actions: {
    setUserInfo(userInfo : User) {
      this.user = userInfo;
      for (const [key, value] of Object.entries(userInfo)) {
        Cookies.set(key, value, { sameSite: 'Lax', expires: 14});
      }
    },

    async login(email: string, password: string) {
      try {
        const response = await api.post('/auth/login', {email, password})
        const userInfo = response.data as User;
        this.setUserInfo(userInfo);
      } catch (error) {
        console.error('Error during login:', error);
        Notify.create({
          color: 'negative',
          message: 'Error during login',
          position: 'top',
          icon: 'report_problem'
        });
      }
    },

    async logout(){
      try{
        const user = useUserStore().getUserInfo();
        if(!user) {
        Notify.create({
          color: 'negative',
          message: 'Error during logout',
          position: 'top',
          icon: 'report_problem'
        });
        return;
        }
        const response = await api.delete('/auth/logout');
        if (response.status === 200) {
          for (const [key] of Object.entries(user)) {
            Cookies.remove(key);
          }
          this.user = undefined;
        }
      } catch (error) {
        console.error('Error during logout:', error);
        Notify.create({
          color: 'negative',
          message: 'Error during logout',
          position: 'top',
          icon: 'report_problem'
        });
      }
    }
  },
});
