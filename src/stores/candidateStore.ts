import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Candidate } from '../components/models';

export const useCandidateStore = defineStore('candidateImportStore', () => {


  const candidates = ref<Candidate[]>([]);
  const isProcessing = ref<boolean>(false);
  const isImported = ref<boolean>(false);


  function setCandidates(csvData : Candidate[]) {
      candidates.value = csvData;
    }

  function removeCandidate(candidate : Candidate){
    const index = candidates.value.indexOf(candidate);
    if (index > -1) {
      candidates.value.splice(index, 1);
    }
  }

  function setIsImported(){
    isImported.value = true;
  }

    return {setCandidates, candidates, isProcessing, removeCandidate, isImported, setIsImported}

});


