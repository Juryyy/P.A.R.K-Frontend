import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { dayResponse } from '../db/types';

export const useExamDayStore = defineStore('examDay', {
  state: () => ({
    upcomingExamDays: ref([]),
    responsesForExamDay: ref<dayResponse[]>([]),
    allExamDays: ref([]),
  }),
  actions: {
    async loadExamDays() {
      try {
        const response = await api.get('/examDays/examDays');
        this.upcomingExamDays = response.data;
      } catch (error : any ) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async loadAllExamDays() {
      try {
        const response = await api.get('/examDays/all');
        this.allExamDays = response.data;
      } catch (error : any ) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async loadResponsesForExamDay(id: number) {
      try {
        const response = await api.get(`/responses/responsesExamDay/${id}`);
        this.responsesForExamDay = response.data;
      } catch (error : any ) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async addExamDay(
      date: Date,
      isForInvigilators: boolean,
      isForExaminers: boolean
    ) {
      try {
        await api.post('/examDays/create', {
          date: date,
          isForInvigilators: isForInvigilators,
          isForExaminers: isForExaminers,
        });
        Notify.create({
          color: 'positive',
          message: 'Exam day added',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any ) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async deleteExamDay(id: number) {
      try {
        await api.delete(`/examDays/delete/${id}`);
        Notify.create({
          color: 'positive',
          message: 'Exam day deleted',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any ) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async changeLock(id: number) {
      try {
        await api.put(`/examDays/changeLock/${id}`);
        Notify.create({
          color: 'positive',
          message: 'Lock changed',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any ) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

      async informUsers(startDate : string, endDate : string, dateOfSubmits : string) {
        try {
          await api.post('/examDays/informUsers', {
            startDate: startDate,
            endDate: endDate,
            dateOfSubmits: dateOfSubmits,
          });
          Notify.create({
            color: 'positive',
            message: 'Users informed',
            position: 'bottom',
            icon: 'check',
            textColor: 'black',
          });
        } catch (error: any) {
          let errorMessage = 'Error during informing users';
          errorMessage = error.response.data.error;

          Notify.create({
            color: 'negative',
            message: errorMessage,
            position: 'bottom',
            icon: 'report_problem',
          });
        }
      }
    },
});
