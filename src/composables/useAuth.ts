import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/authStore';
import { useUserStore } from 'src/stores/userStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';

export function useAuth() {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const router = useRouter();
  const loading = ref(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await authStore.login(email, password);

      if (result.success) {
        NotificationService.success('2FA code sent to your email');
        return true;
      } else {
        NotificationService.error(result.error || 'Login failed');
        return false;
      }
    } catch (error) {
      NotificationService.error('An error occurred. Please try again later.');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const verifyCode = async (email: string, code: string): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await authStore.verifyUser(email, code);

      if (result.success) {
        if (localStorage.getItem('id')) {
          await LoadingService.withLoading(
            async () => userStore.getUserInfo(),
            'Loading your profile'
          );
        }
        NotificationService.success('Verification successful');
        return true;
      } else {
        NotificationService.error(result.error || 'Verification failed');
        return false;
      }
    } catch (error) {
      NotificationService.error('Verification failed. Please try again.');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const logout = async (): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await authStore.logout();
        if (result.success) {
          NotificationService.success('Successfully logged out');
          router.push('/login');
          return true;
        } else {
          NotificationService.error(result.error || 'Logout failed');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred during logout');
        return false;
      }
    }, 'Logging out...');
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await authStore.resetPassword(email);

      if (result.success) {
        NotificationService.success(
          'Password reset instructions sent to your email'
        );
        return true;
      } else {
        NotificationService.error(result.error || 'Password reset failed');
        return false;
      }
    } catch (error) {
      NotificationService.error('Failed to send reset instructions');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updatePassword = async (
    password: string,
    newPassword: string
  ): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await authStore.updatePassword(password, newPassword);

      if (result.success) {
        NotificationService.success('Password updated successfully');
        return true;
      } else {
        NotificationService.error(result.error || 'Failed to update password');
        return false;
      }
    } catch (error) {
      NotificationService.error('Failed to update password');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getToken = async (): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await authStore.getToken();

      if (result.success) {
        return true;
      } else {
        NotificationService.error(result.error || 'Failed to get token');
        return false;
      }
    } catch (error) {
      NotificationService.error('Failed to get token');
      return false;
    } finally {
      loading.value = false;
    }
  };

  return {
    login,
    getToken,
    updatePassword,
    verifyCode,
    logout,
    resetPassword,
    loading,

    isLocked: authStore.isLocked,
    verification: authStore.verification,
  };
}
