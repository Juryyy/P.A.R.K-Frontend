import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { UserAnswers } from './db/types';

export const useAvailabilityStore = defineStore('availability', {
  state: () => ({
    userResponses: ref([]),
  }),
  actions: {
    async loadResponsesForUser() {
      try {
        const response = await api.get('/responses/responses');
        this.userResponses = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting invigilators days',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async submitResponses(answers: UserAnswers[]) {
      try {
        await api.put('/responses/update', answers);
        Notify.create({
          color: 'positive',
          message: 'Responses updated',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during updating responses',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },
  },
});
