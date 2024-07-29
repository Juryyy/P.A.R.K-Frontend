import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { Exam, RoleEnum } from './db/types';

export const useExamStore = defineStore('exam', {
  state: () => ({
    upcomingExams: ref<Exam[]>([]),
    pastExams: ref([]),
    selectedExam: ref<Exam>(),
    selectedExamDay: ref(),
  }),
  actions: {
    async loadUpcomingExams() {
      try {
        const response = await api.get('/exams/upcomingExams');
        this.upcomingExams = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting upcoming exams',
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during creating exam',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async getExam(id: number) {
      try {
        const response = await api.get(`/exams/${id}`);
        console.log(response.data);
        this.selectedExam = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting exam',
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during updating exam',
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during adding worker',
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during removing worker',
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
          icon: 'check',
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during file upload',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async downloadExamSchedule(examId: number, fileName: string) {
      try {
        const response = await api.get(`/onedrive/files/exam/download/${examId}`, {
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during file download',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    }
  },
});
