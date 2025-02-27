import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { AbsentCandidates, Exam, RoleEnum, CentreEnum } from '../db/types';

export interface ExamResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useExamStore = defineStore('exam', {
  state: () => ({
    upcomingExams: ref<Exam[]>([]),
    pastExams: ref<Exam[]>([]),
    selectedExam: ref<Exam>(),
    selectedExamDay: ref(),
    refreshTrigger: ref(0),
  }),
  actions: {
    async loadUpcomingExams(): Promise<ExamResult> {
      try {
        const response = await api.get('/exams/upcomingExams');
        this.upcomingExams = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to load upcoming exams'
        };
      }
    },

    async createExam({ venue, location, type, levels, startTime, endTime, note, dayOfExamsId, adminCentre }: {
      venue: string,
      location: string,
      type: string,
      levels: string[],
      startTime: string,
      endTime: string,
      note: string,
      dayOfExamsId: number,
      adminCentre: CentreEnum
    }): Promise<ExamResult> {
      try {
        const response = await api.post('/exams/createExam',{
          venue,
          location,
          type,
          levels,
          startTime,
          endTime,
          note,
          dayOfExamsId,
          adminCentre
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to create exam'
        };
      }
    },

    async getExam(id: number): Promise<ExamResult> {
      try {
        const response = await api.get(`/exams/${id}`);
        this.selectedExam = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get exam'
        };
      }
    },

    async updateExam(exam: Exam): Promise<ExamResult> {
      try {
        const response = await api.put('/exams/updateExam', {exam});
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update exam'
        };
      }
    },

    async addWorker(examId: number, userId: number, override: boolean, position: string): Promise<ExamResult> {
      try {
        const response = await api.post('/exams/addWorker', {
          examId,
          userId,
          override,
          position
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add worker'
        };
      }
    },

    async removeWorker(examId: number, userId: number, position: string): Promise<ExamResult> {
      try {
        const response = await api.post('/exams/removeWorker', {
          examId,
          userId,
          position
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to remove worker'
        };
      }
    },

    async uploadExamSchedule(file: File, examId: number): Promise<ExamResult> {
      try {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('examId', examId.toString());

        const response = await api.post('/exams/uploadExamSchedule', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to upload exam schedule'
        };
      }
    },

    async downloadExamFile(fileId: number, fileName: string): Promise<ExamResult> {
      try {
        const response = await api.get(`/onedrive/files/exam/download/${fileId}`, {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to download exam file'
        };
      }
    },

    async deleteExamFile(fileId: number): Promise<ExamResult> {
      try {
        const response = await api.delete(`/onedrive/files/exam/delete/${fileId}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to delete exam file'
        };
      }
    },

    async uploadExamDayReport(examId: number, candidates: number, absent: number, comment: string, issues: string, absentCandidates: AbsentCandidates[]): Promise<ExamResult> {
      try {
        const response = await api.post('/exams/createDayReport', {
          examId,
          candidates,
          absent,
          comment,
          issues,
          absentCandidates
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to upload exam day report'
        };
      }
    },

    async downloadExamDayReport(dayReportId: number, fileName: string): Promise<ExamResult> {
      try {
        const response = await api.get(`/onedrive/files/exam/downloadReport/${dayReportId}`, {
          responseType: 'blob',
        });

        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to download exam day report'
        };
      }
    },

    async updateCompleted(examId: number, completed: boolean): Promise<ExamResult> {
      try {
        const response = await api.put('/exams/updateCompleted', {
          examId,
          completed
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update exam completion status'
        };
      }
    },

    async updatePrepared(examId: number, prepared: boolean): Promise<ExamResult> {
      try {
        const response = await api.put('/exams/updatePrepared', {
          examId,
          prepared
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to update exam preparation status'
        };
      }
    },

    async deleteExam(examId: number): Promise<ExamResult> {
      try {
        const response = await api.delete(`/exams/${examId}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to delete exam'
        };
      }
    },

    async getExamsForDay(dayOfExamsId: number): Promise<ExamResult> {
      try {
        const response = await api.get(`/exams/day/${dayOfExamsId}`);
        this.pastExams = this.pastExams.filter(exam => exam.dayOfExamsId !== dayOfExamsId);
        this.pastExams = [...this.pastExams, ...response.data];
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get exams for day'
        };
      }
    },

    async toggleExamConfirmation(examId: number, role: RoleEnum, isConfirmed: boolean): Promise<ExamResult> {
      try {
        const response = await api.put('/exams/confirmation', {
          examId,
          role,
          isConfirmed
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to toggle exam confirmation'
        };
      }
    }
  }
});
