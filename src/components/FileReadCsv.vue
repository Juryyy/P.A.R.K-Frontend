<template>
  <q-file
    v-model="file"
    label="File"
    @input="uploadCSV"
    style="max-width: 230px"
    rounded
    standout="bg-teal text-white"
    accept="text/csv"
    clearable
  >
  </q-file>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Candidate } from './models';
import * as h from 'src/functions/FileReadHelper';
import { useCandidateStore } from 'src/stores/candidateStore';

const candidateStore = useCandidateStore();

const csvData = ref<Candidate[]>([]);
const file = ref<File | null>(null);

const uploadCSV = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const result = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e.target?.error);
      reader.readAsText(file);
    });
    const lines = result.split('\n');
    const headers = lines[0].split(',');
    let id = 0;
    csvData.value = lines
  .slice(1)
  .filter((line) => line.trim() !== '')
  .map((line: string) => {
    const candidate: Candidate = {} as Candidate;
    candidate.venue = '';
    candidate.candidateId = null;
    const cells = line.split(',');
    headers.forEach((header, i: number) => {
      switch (i) {
        case 0:
          candidate.level = h.setLevel(cells[i]);
          candidate.id = id++;
          break;
        case 1:
          candidate.dateOfExam = h.setDateOfExam(cells[i]);
          break;
        case 2:
          candidate.location = cells[i];
          break;
        case 5:
          candidate.typeOfExam = h.setTypeOfExam(cells[i]);
          break;
        case 6:
          candidate.firstName = h.setFirstName(cells[i]);
          candidate.lastName = h.setLastName(cells[i]);
          break;
        case 7:
          candidate.birthDate = h.setBirthDate(cells[i]);
          break;
        case 8:
          candidate.email = h.setEmail(cells[i]);
          break;
        case 9:
          candidate.phone = h.setPhone(cells[i]);
          break;
        case 10:
          candidate.code = h.setCode(cells[i]);
          candidate.orderId = h.setOrderId(cells[i]);
          break;
        case 11:
          candidate.partner = h.setPartner(cells[i]);
          break;
        case 12:
          candidate.mock = h.setMock(cells[i]);
          break;
        case 13:
          candidate.paid = h.setPaid(cells[i]);
          candidate.orderId = h.setOrderId(cells[i]);
          break;
        case 14:
          candidate.requirements = h.setRequirements(cells[i]);
          break;
        case 15:
          candidate.crfToSchool = h.setCrfToSchool(cells[i]);
          break;
        case 16:
          candidate.note = h.setNote(cells[i]);
          break;
      }
    });
    return candidate;
  });
    candidateStore.setCandidates(csvData.value);
    candidateStore.isImported = true;
    console.log(csvData.value);
  }
};
</script>
