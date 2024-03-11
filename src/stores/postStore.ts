import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { Post, RoleEnum } from 'src/stores/db/types';

export const usePostStore = defineStore('post', {
  state: () => ({
    posts : ref<Post[]>([]),
    newPost: ref<Post>(),
  }),
  actions: {
    async addPost(post: Post) {
      try {
        await api.post('/posts/create', {
          title: post.title,
          body: post.body,
          roles: post.roles,
          link: post.link
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
