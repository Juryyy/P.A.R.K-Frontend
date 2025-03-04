import { ref, computed } from 'vue';
import { useCandidateStore } from 'src/stores/candidateStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';
import type { Candidate } from 'src/components/FileRead/models';

export function useCandidate() {
  const candidateStore = useCandidateStore();
  const loading = ref(false);

  const candidates = computed(() => candidateStore.candidates);
  const isProcessing = computed(() => candidateStore.isProcessing);
  const isImported = computed(() => candidateStore.isImported);

  const setCandidates = (csvData: Candidate[]) => {
    candidateStore.setCandidates(csvData);
  };

  const removeCandidate = (candidate: Candidate) => {
    candidateStore.removeCandidate(candidate);
  };

  const uploadCandidates = async (): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await candidateStore.uploadCandidates();

        if (result.success) {
          NotificationService.success('Candidates uploaded successfully');
          candidateStore.candidates = [];
          return true;
        } else {
          NotificationService.error(
            result.error || 'Failed to upload candidates'
          );
          return false;
        }
      } catch (error) {
        NotificationService.error(
          'An error occurred while uploading candidates'
        );
        return false;
      }
    }, 'Uploading candidates...');
  };

  return {
    loading,
    candidates,
    isProcessing,
    isImported,
    setCandidates,
    removeCandidate,
    uploadCandidates,
  };
}
