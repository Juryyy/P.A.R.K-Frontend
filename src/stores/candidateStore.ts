// src/stores/candidateStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Candidate } from '../components/FileRead/models';
import { api } from '../boot/axios';

export interface CandidateResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const useCandidateStore = defineStore('candidateImportStore', {
  state: () => ({
    candidates: ref<Candidate[]>([]),
    isProcessing: ref<boolean>(false),
    isImported: ref<boolean>(false),
  }),

  actions: {
    setCandidates(csvData: Candidate[]) {
      this.candidates = csvData;
    },

    removeCandidate(candidate: Candidate) {
      const index = this.candidates.indexOf(candidate);
      if (index > -1) {
        this.candidates.splice(index, 1);
      }
    },

    async uploadCandidates(): Promise<CandidateResult> {
      try {
        this.isProcessing = true;
        const response = await api.post('/candidates/create', this.candidates);
        this.isProcessing = false;
        return { success: true, data: response.data };
      } catch (error: any) {
        this.isProcessing = false;
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to upload candidates',
        };
      }
    },
  },
});
