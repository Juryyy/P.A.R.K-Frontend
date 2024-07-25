import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { Post, RoleEnum } from 'src/stores/db/types';
import { removeSpaces } from '../helpers/RemoveSpaces';

export const usePostStore = defineStore('post', {
  state: () => ({
    posts : ref<Post[]>([]),
    newPost: ref<Post>(),
  }),
  actions: {
    async addPost(formData: FormData) {
      try {
        await api.post('/posts/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        Notify.create({
          color: 'positive',
          message: 'Post added',
          position: 'bottom',
          icon: 'check',
        });
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during adding post',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async getPosts(){
      try {
        const response = await api.get('/posts/posts');
        console.log(response.data);
        this.posts = response.data;
      } catch (error) {
        Notify.create({
          color: 'negative',
          message: 'Error during getting posts',
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    }
  }
})
