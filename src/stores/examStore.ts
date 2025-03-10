import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { AbsentCandidates, Exam, RoleEnum } from '../db/types';

export const useExamStore = defineStore('exam', {
  state: () => ({
    upcomingExams: ref<Exam[]>([]),
    pastExams: ref<Exam[]>([]),
    selectedExam: ref<Exam>(),
    selectedExamDay: ref(),
    refreshTrigger: ref(0),
  }),
  actions: {

    async loadUpcomingExams() {
      try {
        const response = await api.get('/exams/upcomingExams');
        this.upcomingExams = response.data;
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async createExam({ venue, location, type, levels, startTime, endTime, note, dayOfExamsId }: { venue: string, location: string, type: string, levels: string[], startTime: string, endTime: string, note: string, dayOfExamsId: number }){
      try {
          await api.post('/exams/createExam',{
          venue,
          location,
          type,
          levels,
          startTime,
          endTime,
          note,
          dayOfExamsId
        });
        Notify.create({
          color: 'positive',
          message: 'Exam created',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async getExam(id: number) {
      try {
        const response = await api.get(`/exams/${id}`);
        this.selectedExam = response.data;
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async updateExam(exam: Exam) {
      try {
        await api.put('/exams/updateExam', {exam});
        Notify.create({
          color: 'positive',
          message: 'Exam updated',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async addWorker(examId : number, userId: number, override: boolean, position: string) {
      try {
        await api.post('/exams/addWorker', {
          examId,
          userId,
          override,
          position
        });
        Notify.create({
          color: 'positive',
          message: 'Worker added',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async removeWorker(examId : number, userId: number, position: string) {
      try {
        await api.post('/exams/removeWorker', {
          examId,
          userId,
          position
        });
        Notify.create({
          color: 'positive',
          message: 'Worker removed',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async uploadExamSchedule(file: File, examId: number) {
      try {
        const formData = new FormData();
        formData.append('files', file);
        formData.append('examId', examId.toString());

        await api.post('/exams/uploadExamSchedule', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        Notify.create({
          color: 'positive',
          message: 'File uploaded successfully',
          position: 'bottom',
          textColor: 'black',
          icon: 'check',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async downloadExamFile(fileId: number, fileName: string) {
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

        Notify.create({
          color: 'positive',
          message: 'File downloaded',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async deleteExamFile(fileId: number) {
      try {
        await api.delete(`/onedrive/files/exam/delete/${fileId}`);

        Notify.create({
          color: 'positive',
          message: 'File deleted',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async uploadExamDayReport(examId: number, candidates: number, absent: number, comment: string, issues: string, absentCandidates : AbsentCandidates[]){
      try {
        await api.post('/exams/createDayReport', {
          examId,
          candidates,
          absent,
          comment,
          issues,
          absentCandidates
        });

        Notify.create({
          color: 'positive',
          message: 'Report uploaded',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async downloadExamDayReport(dayReportId: number, fileName: string) {
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

        Notify.create({
          color: 'positive',
          message: 'File downloaded',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async updateCompleted(examId: number, completed: boolean) {
      try {
        await api.put('/exams/updateCompleted', {
          examId,
          completed
        });

        Notify.create({
          color: 'positive',
          message: 'Exam status updated',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async updatePrepared(examId: number, prepared: boolean) {
      try {
        await api.put('/exams/updatePrepared', {
          examId,
          prepared
        });

        Notify.create({
          color: 'positive',
          message: 'Exam status updated',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async deleteExam(examId: number) {
      try {
        await api.delete(`/exams/${examId}`);

        Notify.create({
          color: 'positive',
          message: 'Exam deleted',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async getExamsForDay(dayOfExamsId: number) {
      try {
        const response = await api.get(`/exams/day/${dayOfExamsId}`);
        this.pastExams = this.pastExams.filter(exam => exam.dayOfExamsId !== dayOfExamsId);
        this.pastExams = [...this.pastExams, ...response.data];
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async toggleExamConfirmation(examId: number, role : RoleEnum, isConfirmed : boolean) {
      try {
        await api.put('/exams/confirmation', {
          examId,
          role,
          isConfirmed
        });

        Notify.create({
          color: 'positive',
          message: 'Confirmation status updated',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    }
  },
});
