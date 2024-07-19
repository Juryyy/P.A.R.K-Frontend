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
          position: 'top',
          icon: 'check',
        });
      } catch (error) {
        console.error('Error during verification:', error);
        Notify.create({
          color: 'negative',
          message: 'Error during verification',
          position: 'top',
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
          // Explicitly remove known keys
          const keysToRemove = [
            'id', 'email', 'firstName', 'lastName', 'phone', 'drivingLicense', 'note',
            'adminNote', 'role', 'avatarUrl', 'activatedAccount', 'deactivated', 'isSenior', 'dateOfBirth',
          ];
          keysToRemove.forEach(key => {
            if (localStorage.getItem(key) !== null) {
              localStorage.removeItem(key);
            }
          });
          // Optionally, clear the entire localStorage if it is safe to do so
          // localStorage.clear();

          this.user = undefined;
          Notify.create({
            color: 'positive',
            message: 'Successfully logged out',
            position: 'top',
            icon: 'check_circle',
          });
        } else {
          throw new Error('Logout failed');
        }
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
