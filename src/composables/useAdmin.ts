import { ref, computed } from 'vue';
import { useAdminStore } from 'src/stores/adminStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';
import { CentreEnum, RoleEnum, Location } from 'src/db/types';

export function useAdmin() {
  const adminStore = useAdminStore();
  const loading = ref(false);

  const locationsWithVenues = computed(() => adminStore.locationsWithVenues);

  const updateUserRole = async (id: number, role: string[]): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.updateUserRole(id, role);

        if (result.success) {
          NotificationService.success('User role updated successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update user role');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating user role');
        return false;
      }
    }, 'Updating user role...');
  };

  const registerUser = async (
    firstName: string,
    lastName: string,
    email: string,
    role: RoleEnum[],
    centre: CentreEnum[]
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.registerUser(
          firstName,
          lastName,
          email,
          role,
          centre
        );

        if (result.success) {
          NotificationService.success('User registered successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to register user');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while registering user');
        return false;
      }
    }, 'Registering user...');
  };

  const getLocationsWithVenues = async (): Promise<Location[] | null> => {
    loading.value = true;
    try {
      const result = await adminStore.getLocationsWithVenues();

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(result.error || 'Failed to get locations with venues');
        return null;
      }
    } catch (error) {
      NotificationService.error('An error occurred while getting locations with venues');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deactivateUser = async (id: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.deactivateUser(id);

        if (result.success) {
          NotificationService.success('User deactivated successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to deactivate user');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while deactivating user');
        return false;
      }
    }, 'Deactivating user...');
  };

  const updateUserAdminCentre = async (id: number, adminCentre: CentreEnum[]): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.updateUserAdminCentre(id, adminCentre);

        if (result.success) {
          NotificationService.success('User centre updated successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update user centre');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating user centre');
        return false;
      }
    }, 'Updating user centre...');
  };

  const addLocation = async (location: string, adminCentre: CentreEnum[]): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.addLocation(location, adminCentre);

        if (result.success) {
          NotificationService.success('Location added successfully');
          await adminStore.getLocationsWithVenues();
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to add location');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while adding location');
        return false;
      }
    }, 'Adding location...');
  };

  const addVenue = async (location: number, venue: string, link: string): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.addVenue(location, venue, link);

        if (result.success) {
          NotificationService.success('Venue added successfully');
          await adminStore.getLocationsWithVenues();
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to add venue');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while adding venue');
        return false;
      }
    }, 'Adding venue...');
  };

  const removeLocation = async (location: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.removeLocation(location);

        if (result.success) {
          NotificationService.success('Location removed successfully');
          await adminStore.getLocationsWithVenues();
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to remove location');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while removing location');
        return false;
      }
    }, 'Removing location...');
  };

  const removeVenue = async (venue: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.removeVenue(venue);

        if (result.success) {
          NotificationService.success('Venue removed successfully');
          await adminStore.getLocationsWithVenues();
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to remove venue');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while removing venue');
        return false;
      }
    }, 'Removing venue...');
  };

  const updateUserLevel = async (id: number, level: string[]): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.updateUserLevel(id, level);

        if (result.success) {
          NotificationService.success('User level updated successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update user level');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating user level');
        return false;
      }
    }, 'Updating user level...');
  };

  const updateUserIsSenior = async (id: number, isSenior: boolean): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await adminStore.updateUserIsSenior(id, isSenior);

        if (result.success) {
          NotificationService.success('User senior status updated successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update user senior status');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating user senior status');
        return false;
      }
    }, 'Updating user senior status...');
  };

  return {
    loading,
    locationsWithVenues,
    updateUserRole,
    registerUser,
    getLocationsWithVenues,
    deactivateUser,
    updateUserAdminCentre,
    addLocation,
    addVenue,
    removeLocation,
    removeVenue,
    updateUserLevel,
    updateUserIsSenior
  };
}
