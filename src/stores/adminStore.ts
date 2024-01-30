import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { UserInfo  }  from './db/types';
import { ref } from 'vue';
import { Notify } from 'quasar';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users : ref([]),
  }),
  actions: {
    async getAllUsers(){
      try{
        const response = await api.get('/office/allUsers')
        console.log(response.data);
        this.users = response.data;
      }catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting users',
          position: 'bottom',
          icon: 'report_problem'
        });
      }
    }
  }
});
