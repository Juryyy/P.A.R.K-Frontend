import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { AbsentCandidates, Exam, RoleEnum, CentreEnum, SubstitutionRequest, SubstitutionRequestInfo, SubstitutionApplication} from '../db/types';

export const useSubstitutionStore = defineStore('substitution', {
  state: () => ({
    substitutions: ref<SubstitutionRequest[]>([]),
    examSubs: ref<SubstitutionRequestInfo[]>([]),
    subApplications: ref<SubstitutionApplication[]>([]),
    myApplications: ref<SubstitutionApplication[]>([]),
    count: ref<number>(0),
  }),
  actions: {
    async loadSubstitutions() {
      try {
        const response = await api.get('/substitutions');
        this.substitutions = response.data;
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async loadMyApplications() {
      try {
        const response = await api.get('/substitutions/applications/by_user');
        this.myApplications = response.data;
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async applyForSubstitution(substitutionId: number) {
      try {
        await api.post(`/substitutions/apply/${substitutionId}`);
        Notify.create({
          color: 'positive',
          message: 'Successfully applied for substitution',
          position: 'bottom',
          icon: 'check_circle',
        });
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async createSubstitution(date: Date, examId: number, reason: string, role: RoleEnum, userId: number) {
      try {
        await api.post('/substitutions/create', {
          date,
          examId,
          reason,
          role,
          userId,
        });
        Notify.create({
          color: 'positive',
          message: 'Successfully created substitution',
          position: 'bottom',
          icon: 'check_circle',
        });
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async loadSubsForExam(examId: number) {
      try {
        const response = await api.get(`/substitutions/exam/${examId}`);
        this.examSubs = response.data;
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async withdrawApplication(applicationId: number) {
      try {
        await api.delete(`/substitutions/withdraw/${applicationId}`);
        Notify.create({
          color: 'positive',
          message: 'Successfully withdrew application',
          position: 'bottom',
          icon: 'check_circle',
        });
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async cancelSubstitution(substitutionId: number) {
      try {
        await api.delete(`/substitutions/cancel/${substitutionId}`);
        Notify.create({
          color: 'positive',
          message: 'Successfully deleted substitution',
          position: 'bottom',
          icon: 'check_circle',
        });
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async getCountOfOpenSubstitutions() {
      try {
        const response = await api.get('/substitutions/count');
        this.count = response.data;
      } catch (error: any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },
  }
});
