// src/stores/authStore.ts
import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { User } from '../db/types';

export interface AuthResult {
  success: boolean;
  error?: string;
  data?: any;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    verification: false as boolean,
    email: '' as string,
    loginAttempts: 0 as number,
    isLocked: false as boolean,
  }),

  actions: {
    async verifyUser(email: string, code: string): Promise<AuthResult> {
      try {
        await api.post('/auth/verify', { email, code });
        this.loginAttempts = 0;
        this.isLocked = false;

        const tokenResponse = await api.get('/auth/token');
        localStorage.setItem('token', tokenResponse.data);

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error:
            error.response?.data?.error ||
            'The code is not valid or has expired',
        };
      }
    },

    async login(email: string, password: string): Promise<AuthResult> {
      try {
        if (this.isLocked) {
          return {
            success: false,
            error:
              'Account is temporarily locked. Please try again later or reset your password.',
          };
        }

        const response = await api.post('/auth/login', { email, password });

        if (response.status === 200) {
          this.verification = true;
          this.email = email;
          this.loginAttempts = 0;
          return { success: true };
        }

        return {
          success: false,
          error: 'Login failed',
        };
      } catch (error: any) {
        this.loginAttempts++;

        if (this.loginAttempts >= 5) {
          this.isLocked = true;
          setTimeout(() => {
            this.isLocked = false;
            this.loginAttempts = 0;
          }, 15 * 60 * 1000);
        }

        return {
          success: false,
          error: error.response?.data?.error || 'Invalid credentials',
        };
      }
    },

    async logout(): Promise<AuthResult> {
      try {
        const response = await api.delete('/auth/logout');
        if (response.status === 200) {
          localStorage.clear();
          return { success: true };
        } else {
          return { success: false, error: 'Logout failed' };
        }
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Logout failed',
        };
      }
    },

    async registerUser(
      email: string,
      firstName: string,
      lastName: string,
      role: string
    ): Promise<AuthResult> {
      try {
        const response = await api.post('/office/registerUser', {
          email,
          firstName,
          lastName,
          role,
        });
        return {
          success: true,
          data: response.data,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Registration failed',
        };
      }
    },

    async resetPassword(email: string): Promise<AuthResult> {
      try {
        await api.post('/auth/password-reset', { email });
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to reset password',
        };
      }
    },

    async updatePassword(
      password: string,
      newPassword: string
    ): Promise<AuthResult> {
      try {
        await api.post('/auth/password-update', { password, newPassword });
        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update password',
        };
      }
    },

    async getToken(): Promise<AuthResult> {
      try {
        const response = await api.get('/auth/token');
        localStorage.removeItem('token');
        localStorage.setItem('token', response.data);
        return {
          success: true,
          data: response.data,
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Token retrieval failed',
        };
      }
    },
  },
});
