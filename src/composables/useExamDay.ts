import { ref, computed } from 'vue';
import { useExamDayStore } from 'src/stores/examDayStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';
import { CentreEnum, DayOfExams, dayResponse } from 'src/db/types';

export function useExamDay() {
  const examDayStore = useExamDayStore();
  const loading = ref(false);

  const upcomingExamDays = computed(() => examDayStore.upcomingExamDays);
  const availabilityExamDays = computed(() => examDayStore.availabilityExamDays);
  const responsesForExamDay = computed(() => examDayStore.responsesForExamDay);
  const allExamDays = computed(() => examDayStore.allExamDays);

  const loadExamDays = async (centre: CentreEnum): Promise<DayOfExams[] | null> => {
    loading.value = true;
    try {
      const result = await examDayStore.loadExamDays(centre);
      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(result.error || 'Failed to load exam days');
        return null;
      }
    } catch (error) {
      NotificationService.error('An error occurred while loading exam days');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const loadExamDaysAvailability = async (centre: CentreEnum): Promise<DayOfExams[] | null> => {
    loading.value = true;
    try {
      const result = await examDayStore.loadExamDaysAvailability(centre);

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(result.error || 'Failed to load exam days for availability');
        return null;
      }
    } catch (error) {
      NotificationService.error('An error occurred while loading exam days for availability');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const loadAllExamDays = async (centre: CentreEnum): Promise<any[] | null> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examDayStore.loadAllExamDays(centre);

        if (result.success) {
          return result.data;
        } else {
          NotificationService.error(result.error || 'Failed to load all exam days');
          return null;
        }
      } catch (error) {
        NotificationService.error('An error occurred while loading all exam days');
        return null;
      }
    }, 'Loading all exam days...');
  };

  const loadResponsesForExamDay = async (id: number): Promise<dayResponse[] | null> => {
    loading.value = true;
    try {
      const result = await examDayStore.loadResponsesForExamDay(id);

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(result.error || 'Failed to load responses for exam day');
        return null;
      }
    } catch (error) {
      NotificationService.error('An error occurred while loading responses for exam day');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const addExamDay = async (
    date: Date,
    isForInvigilators: boolean,
    isForExaminers: boolean,
    centre: CentreEnum
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examDayStore.addExamDay(
          date,
          isForInvigilators,
          isForExaminers,
          centre
        );

        if (result.success) {
          NotificationService.success('Exam day added successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to add exam day');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while adding exam day');
        return false;
      }
    }, 'Adding exam day...');
  };

  const deleteExamDay = async (id: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examDayStore.deleteExamDay(id);

        if (result.success) {
          NotificationService.success('Exam day deleted successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to delete exam day');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while deleting exam day');
        return false;
      }
    }, 'Deleting exam day...');
  };

  const changeLock = async (id: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examDayStore.changeLock(id);

        if (result.success) {
          NotificationService.success('Lock status changed successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to change lock status');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while changing lock status');
        return false;
      }
    }, 'Changing lock status...');
  };

  const informUsers = async (
    startDate: string,
    endDate: string,
    dateOfSubmits: string,
    centre: CentreEnum
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examDayStore.informUsers(
          startDate,
          endDate,
          dateOfSubmits,
          centre
        );

        if (result.success) {
          NotificationService.success('Users informed successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to inform users');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while informing users');
        return false;
      }
    }, 'Informing users...');
  };

  return {
    loading,
    upcomingExamDays,
    availabilityExamDays,
    responsesForExamDay,
    allExamDays,
    loadExamDays,
    loadExamDaysAvailability,
    loadAllExamDays,
    loadResponsesForExamDay,
    addExamDay,
    deleteExamDay,
    changeLock,
    informUsers
  };
}
