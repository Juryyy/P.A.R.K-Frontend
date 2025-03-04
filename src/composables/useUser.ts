import { ref } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';
import { User } from 'src/db/types';

export function useUser() {
  const userStore = useUserStore();
  const loading = ref(false);

  const getUsersExams = async () => {
    loading.value = true;
    try {
      const result = await userStore.getUsersExams();

      if (!result.success) {
        NotificationService.error(result.error || 'Failed to get user exams');
      }

      return result.success ? result.data : null;
    } catch (error) {
      NotificationService.error('An error occurred while fetching user exams');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getUsersAvatar = async (): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await userStore.getUsersAvatar();

      if (!result.success) {
        NotificationService.error(result.error || 'Failed to get user avatar');
      }

      return result.success;
    } catch (error) {
      NotificationService.error('An error occurred while fetching user avatar');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getProfile = async (userId: number): Promise<User | null> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await userStore.getProfile(userId);

        if (result.success) {
          return result.data;
        } else {
          NotificationService.error(
            result.error || 'Failed to get user profile'
          );
          return null;
        }
      } catch (error) {
        NotificationService.error(
          'An error occurred while fetching user profile'
        );
        return null;
      }
    }, 'Loading profile...');
  };

  const getUserAvatarById = async (userId: number): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await userStore.getUserAvatarById(userId);

      if (!result.success) {
        NotificationService.error(result.error || 'Failed to get user avatar');
      }

      return result.success;
    } catch (error) {
      NotificationService.error('An error occurred while fetching user avatar');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getAllUsers = async (): Promise<User[] | null> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await userStore.getAllUsers();

        if (result.success) {
          return result.data;
        } else {
          NotificationService.error(result.error || 'Failed to get all users');
          return null;
        }
      } catch (error) {
        NotificationService.error('An error occurred while fetching all users');
        return null;
      }
    }, 'Loading users...');
  };

  const updateProfile = async (
    id: number,
    email: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    note: string | null,
    noteLonger: string | null,
    drivingLicense: boolean,
    phone: string | null,
    totaraDate: string | undefined,
    totaraDone: boolean,
    insperaAccount: boolean
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await userStore.updateProfile(
          id,
          email,
          firstName,
          lastName,
          dateOfBirth,
          note,
          noteLonger,
          drivingLicense,
          phone,
          totaraDate,
          totaraDone,
          insperaAccount
        );

        if (result.success) {
          NotificationService.success('Profile updated successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update profile');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating profile');
        return false;
      }
    }, 'Updating profile...');
  };

  const updateAdminNote = async (
    id: number,
    adminNote: string | null
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await userStore.updateAdminNote(id, adminNote);

        if (result.success) {
          NotificationService.success('Admin note updated successfully');
          return true;
        } else {
          NotificationService.error(
            result.error || 'Failed to update admin note'
          );
          return false;
        }
      } catch (error) {
        NotificationService.error(
          'An error occurred while updating admin note'
        );
        return false;
      }
    }, 'Updating admin note...');
  };

  const uploadAvatar = async (file: File): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await userStore.uploadAvatar(file);

        if (result.success) {
          NotificationService.success('Avatar uploaded successfully');
          await userStore.getUsersAvatar();
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to upload avatar');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while uploading avatar');
        return false;
      }
    }, 'Uploading avatar...');
  };

  const updateInsperaAccount = async (
    id: number,
    insperaAccount: boolean
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await userStore.updateInsperaAccount(id, insperaAccount);

        if (result.success) {
          NotificationService.success(
            'Inspera account status updated successfully'
          );
          return true;
        } else {
          NotificationService.error(
            result.error || 'Failed to update Inspera account status'
          );
          return false;
        }
      } catch (error) {
        NotificationService.error(
          'An error occurred while updating Inspera account status'
        );
        return false;
      }
    }, 'Updating Inspera account status...');
  };

  const refreshUserInfo = async (): Promise<boolean> => {
    try {
      const result = await userStore.refreshUserInfo();
      return result.success;
    } catch (error) {
      NotificationService.error('Failed to refresh user information');
      return false;
    }
  };

  const getUserInfo = () => {
    try {
      const user = userStore.getUserInfo();
      return user;
    } catch (error) {
      NotificationService.error('Failed to get user information');
      return null;
    }
  };

  const getUserRole = () => {
    try {
      const user = userStore.getUserRole();
      return user;
    } catch (error) {
      NotificationService.error('Failed to get user role');
      return null;
    }
  };

  return {
    loading,
    getUsersExams,
    getUsersAvatar,
    getProfile,
    getUserAvatarById,
    getAllUsers,
    updateProfile,
    updateAdminNote,
    uploadAvatar,
    updateInsperaAccount,
    refreshUserInfo,
    getUserInfo,
    getUserRole,

    clearSelectedUserInfo: userStore.clearSelectedUserInfo,
    changeConfirmation: userStore.changeConfirmation,
    updatePasswordStatus: userStore.updatePasswordStatus,
    toggleRightDrawer: userStore.toggleRightDrawer,

    user: userStore.user,
    users: userStore.users,
    usersExams: userStore.usersExams,
    userAvatar: userStore.userAvatar,
    selectedUser: userStore.selectedUser,
    selectedUserAvatar: userStore.selectedUserAvatar,
    updateConfirmation: userStore.updateConfirmation,
    refreshTrigger: userStore.refreshTrigger,
    rightDrawerOpen: userStore.rightDrawerOpen,
  };
}
