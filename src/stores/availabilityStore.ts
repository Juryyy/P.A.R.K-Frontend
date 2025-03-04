// src/stores/availabilityStore.ts
import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { UserAnswers } from '../db/types';

export interface AvailabilityResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useAvailabilityStore = defineStore('availability', {
  state: () => ({
    userResponses: ref([]),
    newResponses: ref<number>(),
  }),
  actions: {
    async loadResponsesForUser(): Promise<AvailabilityResult> {
      try {
        const response = await api.get('/responses/responses');
        this.userResponses = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error:
            error.response?.data?.error || 'Failed to load responses for user',
        };
      }
    },

    async countNewResponses(): Promise<AvailabilityResult> {
      try {
        const response = await api.get('/responses/responses/new');
        this.newResponses = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to count new responses',
        };
      }
    },

    async submitResponses(answers: UserAnswers[]): Promise<AvailabilityResult> {
      try {
        const response = await api.put('/responses/update', answers);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to submit responses',
        };
      }
    },
  },
});
