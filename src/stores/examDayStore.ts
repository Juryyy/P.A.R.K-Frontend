import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';

export const useExamDayStore = defineStore('examDay', {
  state: () => ({
    upcomingExamDays: ref([]),
    responsesForExamDay: ref([])
  }),
  actions:{
    async loadExamDays(){
      try{
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

    async loadResponsesForExamDay(id : number){
      try{
        const response = await api.get(`/responses/responsesExamDay/${id}`)
        console.log(response.data)
        this.responsesForExamDay = response.data;
      }catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting responses',
          position: 'bottom',
          icon: 'report_problem'
        });
      }
    }
  }

});
