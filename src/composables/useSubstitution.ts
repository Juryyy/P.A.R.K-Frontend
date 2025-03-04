import { ref, computed } from 'vue';
import { useSubstitutionStore } from 'src/stores/substitutionStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';
import {
  RoleEnum,
  SubstitutionRequest,
  SubstitutionApplication,
} from 'src/db/types';

export function useSubstitution() {
  const substitutionStore = useSubstitutionStore();
  const loading = ref(false);

  const substitutions = computed(() => substitutionStore.substitutions);
  const examSubs = computed(() => substitutionStore.examSubs);
  const myApplications = computed(() => substitutionStore.myApplications);
  const count = computed(() => substitutionStore.count);

  const loadSubstitutions = async (): Promise<SubstitutionRequest[] | null> => {
    loading.value = true;
    try {
      const result = await substitutionStore.loadSubstitutions();

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(
          result.error || 'Failed to load substitutions'
        );
        return null;
      }
    } catch (error) {
      NotificationService.error(
        'An error occurred while loading substitutions'
      );
      return null;
    } finally {
      loading.value = false;
    }
  };

  const loadMyApplications = async (): Promise<
    SubstitutionApplication[] | null
  > => {
    loading.value = true;
    try {
      const result = await substitutionStore.loadMyApplications();

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(
          result.error || 'Failed to load your applications'
        );
        return null;
      }
    } catch (error) {
      NotificationService.error(
        'An error occurred while loading your applications'
      );
      return null;
    } finally {
      loading.value = false;
    }
  };

  const applyForSubstitution = async (
    substitutionId: number
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await substitutionStore.applyForSubstitution(
          substitutionId
        );

        if (result.success) {
          NotificationService.success('Successfully applied for substitution');
          return true;
        } else {
          NotificationService.error(
            result.error || 'Failed to apply for substitution'
          );
          return false;
        }
      } catch (error) {
        NotificationService.error(
          'An error occurred while applying for substitution'
        );
        return false;
      }
    }, 'Applying for substitution...');
  };

  const createSubstitution = async (
    date: Date,
    examId: number,
    reason: string,
    role: RoleEnum,
    userId: number
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await substitutionStore.createSubstitution(
          date,
          examId,
          reason,
          role,
          userId
        );

        if (result.success) {
          NotificationService.success(
            'Substitution request created successfully'
          );
          return true;
        } else {
          NotificationService.error(
            result.error || 'Failed to create substitution request'
          );
          return false;
        }
      } catch (error) {
        NotificationService.error(
          'An error occurred while creating substitution request'
        );
        return false;
      }
    }, 'Creating substitution request...');
  };

  const loadSubsForExam = async (examId: number): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await substitutionStore.loadSubsForExam(examId);

      if (result.success) {
        return true;
      } else {
        NotificationService.error(
          result.error || 'Failed to load substitutions for exam'
        );
        return false;
      }
    } catch (error) {
      NotificationService.error(
        'An error occurred while loading substitutions for exam'
      );
      return false;
    } finally {
      loading.value = false;
    }
  };

  const withdrawApplication = async (
    applicationId: number
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await substitutionStore.withdrawApplication(
          applicationId
        );

        if (result.success) {
          NotificationService.success('Application withdrawn successfully');
          return true;
        } else {
          NotificationService.error(
            result.error || 'Failed to withdraw application'
          );
          return false;
        }
      } catch (error) {
        NotificationService.error(
          'An error occurred while withdrawing application'
        );
        return false;
      }
    }, 'Withdrawing application...');
  };

  const cancelSubstitution = async (
    substitutionId: number
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await substitutionStore.cancelSubstitution(
          substitutionId
        );

        if (result.success) {
          NotificationService.success('Substitution canceled successfully');
          return true;
        } else {
          NotificationService.error(
            result.error || 'Failed to cancel substitution'
          );
          return false;
        }
      } catch (error) {
        NotificationService.error(
          'An error occurred while canceling substitution'
        );
        return false;
      }
    }, 'Canceling substitution...');
  };

  const getCountOfOpenSubstitutions = async (): Promise<number | null> => {
    loading.value = true;
    try {
      const result = await substitutionStore.getCountOfOpenSubstitutions();

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(
          result.error || 'Failed to get count of open substitutions'
        );
        return null;
      }
    } catch (error) {
      NotificationService.error(
        'An error occurred while getting count of open substitutions'
      );
      return null;
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    substitutions,
    examSubs,
    myApplications,
    count,
    loadSubstitutions,
    loadMyApplications,
    applyForSubstitution,
    createSubstitution,
    loadSubsForExam,
    withdrawApplication,
    cancelSubstitution,
    getCountOfOpenSubstitutions,
  };
}
