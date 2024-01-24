import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';

export const useExamDayStore = defineStore('examDay', {
  state: () => ({
    upcomingExamDays: ref([]),
  }),
  actions:{
    async loadExamDays(){
      try{
        console.log(api.defaults)
        const response = await api.get('/examDays/examDays')
        this.upcomingExamDays = response.data;
      }catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting exam days',
          position: 'bottom',
          icon: 'report_problem'
        });
      }
    },
  }

});
