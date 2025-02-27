import { ref, computed } from 'vue';
import { useAvailabilityStore } from 'src/stores/availabilityStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';
import { UserAnswers } from 'src/db/types';

export function useAvailability() {
  const availabilityStore = useAvailabilityStore();
  const loading = ref(false);

  const userResponses = computed(() => availabilityStore.userResponses);
  const newResponses = computed(() => availabilityStore.newResponses);

  const loadResponsesForUser = async (): Promise<any[] | null> => {
    loading.value = true;
    try {
      const result = await availabilityStore.loadResponsesForUser();

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(result.error || 'Failed to load your responses');
        return null;
      }
    } catch (error) {
      NotificationService.error('An error occurred while loading your responses');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const countNewResponses = async (): Promise<number | null> => {
    loading.value = true;
    try {
      const result = await availabilityStore.countNewResponses();

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(result.error || 'Failed to count new responses');
        return null;
      }
    } catch (error) {
      NotificationService.error('An error occurred while counting new responses');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const submitResponses = async (answers: UserAnswers[]): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await availabilityStore.submitResponses(answers);

        if (result.success) {
          NotificationService.success('Responses submitted successfully');
          await availabilityStore.countNewResponses();
          await availabilityStore.loadResponsesForUser();
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to submit responses');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while submitting responses');
        return false;
      }
    }, 'Submitting responses...');
  };

  return {
    loading,
    userResponses,
    newResponses,
    loadResponsesForUser,
    countNewResponses,
    submitResponses
  }
};
