import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { Exam } from './db/types';

export const useExamStore = defineStore('exam', {
  state: () => ({
    upcomingExams: ref<Exam[]>([]),
    pastExams: ref([]),
    selectedExam: ref(null),
  }),
  actions:{
    async loadUpcomingExams() {
      try {
        const response = await api.get('/exams/upcomingExams');
        this.upcomingExams = response.data;
        console.log(this.upcomingExams)
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting upcoming exams',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async createExam(exam : any){
      try{
        console.log(exam)
        await api.post('/exams/createExam', exam)
        Notify.create({
          color: 'positive',
          message: 'Exam created',
          position: 'bottom',
          icon: 'check'
        });
      }catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during creating exam',
          position: 'bottom',
          icon: 'report_problem'
        });
      }
    }
  }
});
