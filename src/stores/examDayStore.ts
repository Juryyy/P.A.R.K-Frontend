// src/stores/examDayStore.ts
import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { CentreEnum, dayResponse, DayOfExams } from '../db/types';

export interface ExamDayResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useExamDayStore = defineStore('examDay', {
  state: () => ({
    upcomingExamDays: ref<DayOfExams[]>([]),
    availabilityExamDays: ref<DayOfExams[]>([]),
    responsesForExamDay: ref<dayResponse[]>([]),
    allExamDays: ref([]),
  }),
  actions: {
    async loadExamDays(centre: CentreEnum): Promise<ExamDayResult> {
      try {
        const response = await api.get<DayOfExams[]>('/examDays/examDays', {
          params: { centre },
        });
        const existingExamDays = new Map<number, DayOfExams>(
          this.upcomingExamDays.map((examDay: DayOfExams) => [
            examDay.id || 0,
            examDay,
          ])
        );

        response.data.forEach((newExamDay: DayOfExams) => {
          if (newExamDay.id !== undefined) {
            existingExamDays.set(newExamDay.id, newExamDay);
          }
        });

        this.upcomingExamDays = Array.from(existingExamDays.values());
        return { success: true, data: this.upcomingExamDays };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to load exam days',
        };
      }
    },

    async loadExamDaysAvailability(centre: CentreEnum): Promise<ExamDayResult> {
      try {
        const response = await api.get<DayOfExams[]>('/examDays/examDays', {
          params: { centre },
        });
        const newIds = new Set(response.data.map((day) => day.id));

        this.availabilityExamDays = this.availabilityExamDays
          .filter((day) => newIds.has(day.id))
          .concat(
            response.data.filter(
              (newDay) =>
                !this.availabilityExamDays.find(
                  (existingDay) => existingDay.id === newDay.id
                )
            )
          );
        return { success: true, data: this.availabilityExamDays };
      } catch (error: any) {
        return {
          success: false,
          error:
            error.response?.data?.error ||
            'Failed to load exam days for availability',
        };
      }
    },

    async loadAllExamDays(centre: CentreEnum): Promise<ExamDayResult> {
      try {
        const response = await api.get('/examDays/all', {
          params: {
            centre: centre,
          },
        });
        this.allExamDays = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to load all exam days',
        };
      }
    },

    async loadResponsesForExamDay(id: number): Promise<ExamDayResult> {
      try {
        const response = await api.get(`/responses/responsesExamDay/${id}`);
        this.responsesForExamDay = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error:
            error.response?.data?.error ||
            'Failed to load responses for exam day',
        };
      }
    },

    async addExamDay(
      date: Date,
      isForInvigilators: boolean,
      isForExaminers: boolean,
      centre: CentreEnum
    ): Promise<ExamDayResult> {
      try {
        const response = await api.post('/examDays/create', {
          date: date,
          isForInvigilators: isForInvigilators,
          isForExaminers: isForExaminers,
          centre: centre,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add exam day',
        };
      }
    },

    async deleteExamDay(id: number): Promise<ExamDayResult> {
      try {
        const response = await api.delete(`/examDays/delete/${id}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to delete exam day',
        };
      }
    },

    async changeLock(id: number): Promise<ExamDayResult> {
      try {
        const response = await api.put(`/examDays/changeLock/${id}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to change lock status',
        };
      }
    },

    async informUsers(
      startDate: string,
      endDate: string,
      dateOfSubmits: string,
      centre: CentreEnum
    ): Promise<ExamDayResult> {
      try {
        const response = await api.post('/examDays/informUsers', {
          startDate: startDate,
          endDate: endDate,
          dateOfSubmits: dateOfSubmits,
          centre: centre,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to inform users',
        };
      }
    },
  },
});
