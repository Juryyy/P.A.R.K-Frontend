import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { Exam } from './db/types';

export const useExamStore = defineStore('exam', {
  state: () => ({
    upcomingExams: ref<Exam[]>([]),
    pastExams: ref([]),
    selectedExam: ref<Exam>(),
    selectedExamDay: ref(),
  }),
  actions: {
    async loadUpcomingExams() {
      try {
        const response = await api.get('/exams/upcomingExams');
        this.upcomingExams = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting upcoming exams',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async createExam({ venue, location, type, levels, startTime, endTime, note, dayOfExamsId }: { venue: string, location: string, type: string, levels: string[], startTime: string, endTime: string, note: string, dayOfExamsId: number }){
      try {
        console.log('venue', venue, 'location', location, 'type', type, 'levels', levels, 'startTime', startTime, 'endTime', endTime, 'note', note, 'dayOfExamsId', dayOfExamsId);
        await api.post('/exams/createExam',{
          venue,
          location,
          type,
          levels,
          startTime,
          endTime,
          note,
          dayOfExamsId
        });
        Notify.create({
          color: 'positive',
          message: 'Exam created',
          position: 'bottom',
          icon: 'check',
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during creating exam',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async getExam(id: number) {
      try {
        const response = await api.get(`/exams/${id}`);
        this.selectedExam = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting exam',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    }
  },
});
