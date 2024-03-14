import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';

export const useExamDayStore = defineStore('examDay', {
  state: () => ({
    upcomingExamDays: ref([]),
    responsesForExamDay: ref([]),
  }),
  actions: {
    async loadExamDays() {
      try {
        const response = await api.get('/examDays/examDays');
        this.upcomingExamDays = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting exam days',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async loadResponsesForExamDay(id: number) {
      try {
        const response = await api.get(`/responses/responsesExamDay/${id}`);
        console.log(response.data);
        this.responsesForExamDay = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting responses',
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during adding exam day',
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during deleting exam day',
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
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during changing lock',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    }
  },
});
