import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { User } from './db/types';
import { Notify } from 'quasar';
import { useUserStore } from './userStore';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: undefined as User | undefined,
    verification : false as boolean,
    email : '' as string,
  }),
  actions: {

    setUserInfo(userInfo: User) {
      this.user = userInfo;
      for (const [key, value] of Object.entries(userInfo)) {
        if (key === 'role' && Array.isArray(value)) {
          localStorage.setItem(key, JSON.stringify(value)); // Serialize array to JSON
        } else {
          localStorage.setItem(key, String(value));
        }
      }
    },

    async verifyUser(email : string, code : string){ {
      try {
        const response = await api.post('/auth/verify', { email, code });
        const userInfo = response.data as User;
        this.setUserInfo(userInfo);
        Notify.create({
          color: 'positive',
          message: 'Verification successful',
          position: 'bottom',
          icon: 'check',
        });
      } catch (error) {
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
        });
      } catch (error) {
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
          // Explicitly remove known keys
          //const keysToRemove = [
          //  'id', 'email', 'firstName', 'lastName', 'phone', 'drivingLicense', 'note',
          //  'adminNote', 'role', 'avatarUrl', 'activatedAccount', 'deactivated', 'isSenior', 'dateOfBirth',
          //];
          //keysToRemove.forEach(key => {
          //  if (localStorage.getItem(key) !== null) {
          //    localStorage.removeItem(key);
          //  }
          //});
          // Optionally, clear the entire localStorage if it is safe to do so
          localStorage.clear();

          this.user = undefined;
          Notify.create({
            color: 'positive',
            message: 'Successfully logged out',
            position: 'bottom',
            icon: 'check_circle',
          });
        } else {
          throw new Error('Logout failed');
        }
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during logout',
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
        });
      } catch (error : any) {
        let errorMessage = 'Error during registration';
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        Notify.create({
          color: 'negative',
          message: errorMessage,
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during password reset',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async updatePassword(oldPassword: string, newPassword: string) {
      try {
        await api.post('/auth/updatePassword', { oldPassword, newPassword });
        Notify.create({
          color: 'positive',
          message: 'Password updated',
          position: 'bottom',
          icon: 'check',
        });
      } catch (error) {
          Notify.create({
          color: 'negative',
          message: 'Error during password update',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    }

  },
});
