import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Candidate } from '../components/models';
import { api } from '../boot/axios';
import { Notify } from 'quasar';


export const useCandidateStore = defineStore('candidateImportStore', {
  state: () => ({
    candidates: ref<Candidate[]>([]),
    isProcessing: ref<boolean>(false),
    isImported: ref<boolean>(false)
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

    async uploadCandidates(){
      try{
        this.isProcessing = true;
        const response = await api.post('/candidates/create', this.candidates);
        Notify.create({
          color: 'positive',
          message: response.data.success,
          position: 'bottom',
          icon: 'check',
        });
      }catch(error){
        Notify.create({
          color: 'negative',
          message: 'Error during uploading candidates',
          position: 'bottom',
          icon: 'report_problem',
        });
    }
  },
  }
});
