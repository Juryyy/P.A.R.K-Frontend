// src/stores/substitutionStore.ts
import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { RoleEnum, SubstitutionRequest, SubstitutionRequestInfo, SubstitutionApplication } from '../db/types';

export interface SubstitutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useSubstitutionStore = defineStore('substitution', {
  state: () => ({
    substitutions: ref<SubstitutionRequest[]>([]),
    examSubs: ref<SubstitutionRequestInfo[]>([]),
    subApplications: ref<SubstitutionApplication[]>([]),
    myApplications: ref<SubstitutionApplication[]>([]),
    count: ref<number>(0),
  }),
  actions: {
    async loadSubstitutions(): Promise<SubstitutionResult> {
      try {
        const response = await api.get('/substitutions');
        this.substitutions = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to load substitutions'
        };
      }
    },

    async loadMyApplications(): Promise<SubstitutionResult> {
      try {
        const response = await api.get('/substitutions/applications/by_user');
        this.myApplications = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to load your applications'
        };
      }
    },

    async applyForSubstitution(substitutionId: number): Promise<SubstitutionResult> {
      try {
        const response = await api.post(`/substitutions/apply/${substitutionId}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to apply for substitution'
        };
      }
    },

    async createSubstitution(
      date: Date,
      examId: number,
      reason: string,
      role: RoleEnum,
      userId: number
    ): Promise<SubstitutionResult> {
      try {
        const response = await api.post('/substitutions/create', {
          date,
          examId,
          reason,
          role,
          userId,
        });
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to create substitution'
        };
      }
    },

    async loadSubsForExam(examId: number): Promise<SubstitutionResult> {
      try {
        const response = await api.get(`/substitutions/exam/${examId}`);
        this.examSubs = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to load substitutions for exam'
        };
      }
    },

    async withdrawApplication(applicationId: number): Promise<SubstitutionResult> {
      try {
        const response = await api.delete(`/substitutions/withdraw/${applicationId}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to withdraw application'
        };
      }
    },

    async cancelSubstitution(substitutionId: number): Promise<SubstitutionResult> {
      try {
        const response = await api.delete(`/substitutions/cancel/${substitutionId}`);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to cancel substitution'
        };
      }
    },

    async getCountOfOpenSubstitutions(): Promise<SubstitutionResult> {
      try {
        const response = await api.get('/substitutions/count');
        this.count = response.data;
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get count of open substitutions'
        };
      }
    },
  }
});
