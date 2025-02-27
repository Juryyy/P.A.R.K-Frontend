import { ref } from 'vue';
import { useExamStore } from 'src/stores/examStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';
import { Exam, AbsentCandidates, RoleEnum, CentreEnum } from 'src/db/types';

export function useExam() {
  const examStore = useExamStore();
  const loading = ref(false);

  const loadUpcomingExams = async (): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await examStore.loadUpcomingExams();

      if (result.success) {
        return true;
      } else {
        NotificationService.error(result.error || 'Failed to load upcoming exams');
        return false;
      }
    } catch (error) {
      NotificationService.error('An error occurred while loading exams');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const createExam = async (examData: {
    venue: string;
    location: string;
    type: string;
    levels: string[];
    startTime: string;
    endTime: string;
    note: string;
    dayOfExamsId: number;
    adminCentre: CentreEnum;
  }): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.createExam(examData);

        if (result.success) {
          NotificationService.success('Exam created successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to create exam');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while creating the exam');
        return false;
      }
    }, 'Creating exam...');
  };

  const getExam = async (id: number): Promise<Exam | null> => {
    loading.value = true;
    try {
      const result = await examStore.getExam(id);

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(result.error || 'Failed to get exam details');
        return null;
      }
    } catch (error) {
      NotificationService.error('An error occurred while fetching exam details');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateExam = async (exam: Exam): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.updateExam(exam);

        if (result.success) {
          NotificationService.success('Exam updated successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update exam');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating the exam');
        return false;
      }
    }, 'Updating exam...');
  };

  const addWorker = async (examId: number, userId: number, override: boolean, position: string): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await examStore.addWorker(examId, userId, override, position);

      if (result.success) {
        NotificationService.success('Worker added successfully');
        return true;
      } else {
        NotificationService.error(result.error || 'Failed to add worker');
        return false;
      }
    } catch (error) {
      NotificationService.error('An error occurred while adding the worker');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const removeWorker = async (examId: number, userId: number, position: string): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await examStore.removeWorker(examId, userId, position);

      if (result.success) {
        NotificationService.success('Worker removed successfully');
        return true;
      } else {
        NotificationService.error(result.error || 'Failed to remove worker');
        return false;
      }
    } catch (error) {
      NotificationService.error('An error occurred while removing the worker');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const uploadExamSchedule = async (file: File, examId: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.uploadExamSchedule(file, examId);

        if (result.success) {
          NotificationService.success('Schedule uploaded successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to upload schedule');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while uploading the schedule');
        return false;
      }
    }, 'Uploading schedule...');
  };

  const downloadExamFile = async (fileId: number, fileName: string): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.downloadExamFile(fileId, fileName);

        if (result.success) {
          NotificationService.success('File downloaded successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to download file');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while downloading the file');
        return false;
      }
    }, 'Downloading file...');
  };

  const deleteExamFile = async (fileId: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.deleteExamFile(fileId);

        if (result.success) {
          NotificationService.success('File deleted successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to delete file');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while deleting the file');
        return false;
      }
    }, 'Deleting file...');
  };

  const uploadExamDayReport = async (
    examId: number,
    candidates: number,
    absent: number,
    comment: string,
    issues: string,
    absentCandidates: AbsentCandidates[]
  ): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.uploadExamDayReport(
          examId,
          candidates,
          absent,
          comment,
          issues,
          absentCandidates
        );

        if (result.success) {
          NotificationService.success('Exam day report uploaded successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to upload exam day report');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while uploading the exam day report');
        return false;
      }
    }, 'Uploading exam day report...');
  };

  const downloadExamDayReport = async (dayReportId: number, fileName: string): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.downloadExamDayReport(dayReportId, fileName);

        if (result.success) {
          NotificationService.success('Exam day report downloaded successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to download exam day report');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while downloading the exam day report');
        return false;
      }
    }, 'Downloading exam day report...');
  };

  const updateCompleted = async (examId: number, completed: boolean): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.updateCompleted(examId, completed);

        if (result.success) {
          NotificationService.success(`Exam ${completed ? 'marked as completed' : 'unmarked as completed'}`);
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update exam completion status');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating the exam completion status');
        return false;
      }
    }, 'Updating exam status...');
  };

  const updatePrepared = async (examId: number, prepared: boolean): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.updatePrepared(examId, prepared);

        if (result.success) {
          NotificationService.success(`Exam ${prepared ? 'marked as prepared' : 'unmarked as prepared'}`);
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update exam preparation status');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating the exam preparation status');
        return false;
      }
    }, 'Updating exam status...');
  };

  const deleteExam = async (examId: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.deleteExam(examId);

        if (result.success) {
          NotificationService.success('Exam deleted successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to delete exam');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while deleting the exam');
        return false;
      }
    }, 'Deleting exam...');
  };

  const getExamsForDay = async (dayOfExamsId: number): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await examStore.getExamsForDay(dayOfExamsId);

      if (result.success) {
        return true;
      } else {
        NotificationService.error(result.error || 'Failed to get exams for day');
        return false;
      }
    } catch (error) {
      NotificationService.error('An error occurred while fetching exams');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const toggleExamConfirmation = async (examId: number, role: RoleEnum, isConfirmed: boolean): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await examStore.toggleExamConfirmation(examId, role, isConfirmed);

        if (result.success) {
          NotificationService.success(`Exam ${isConfirmed ? 'confirmed' : 'unconfirmed'} successfully`);
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to update confirmation status');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while updating the confirmation status');
        return false;
      }
    }, 'Updating confirmation status...');
  };

  return {
    loading,
    loadUpcomingExams,
    createExam,
    getExam,
    updateExam,
    addWorker,
    removeWorker,
    uploadExamSchedule,
    downloadExamFile,
    deleteExamFile,
    uploadExamDayReport,
    downloadExamDayReport,
    updateCompleted,
    updatePrepared,
    deleteExam,
    getExamsForDay,
    toggleExamConfirmation,

    pastExams: examStore.pastExams,
    upcomingExams: examStore.upcomingExams,
    selectedExam: examStore.selectedExam,
    selectedExamDay: examStore.selectedExamDay,
    refreshTrigger: examStore.refreshTrigger,
  };
}
