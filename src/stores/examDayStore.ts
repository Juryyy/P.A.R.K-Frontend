import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { CentreEnum, dayResponse, DayOfExams } from '../db/types';

export const useExamDayStore = defineStore('examDay', {
  state: () => ({
    upcomingExamDays: ref<DayOfExams[]>([]),
    responsesForExamDay: ref<dayResponse[]>([]),
    allExamDays: ref([]),
  }),
  actions: {
    async loadExamDays(centre: CentreEnum) {
      try {
        const response = await api.get<DayOfExams[]>('/examDays/examDays', {
          params: {
            centre: centre
          }
        });
        const existingExamDays = new Map<number, DayOfExams>(
          this.upcomingExamDays.map((examDay: DayOfExams) => [examDay.id || 0, examDay])
        );

        response.data.forEach((newExamDay: DayOfExams) => {
          if (newExamDay.id !== undefined) {
            existingExamDays.set(newExamDay.id, newExamDay);
          }
        });

        this.upcomingExamDays = Array.from(existingExamDays.values());
        console.log('examDays:', this.upcomingExamDays);
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async loadAllExamDays(centre: CentreEnum) {
      try {
        const response = await api.get('/examDays/all',{
          params: {
            centre: centre
          }
        });
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
      isForExaminers: boolean,
      centre: CentreEnum
    ) {
      try {
        await api.post('/examDays/create', {
          date: date,
          isForInvigilators: isForInvigilators,
          isForExaminers: isForExaminers,
          centre: centre,
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

      async informUsers(startDate : string, endDate : string, dateOfSubmits : string, centre : CentreEnum) {
        try {
          await api.post('/examDays/informUsers', {
            startDate: startDate,
            endDate: endDate,
            dateOfSubmits: dateOfSubmits,
            centre: centre,
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
