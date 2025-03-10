import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { Notify } from 'quasar';
import { ref } from 'vue';
import { Post, RoleEnum, PostWithAvatar } from 'src/db/types';

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: ref<PostWithAvatar[]>([]),
    newPost: ref<PostWithAvatar | null>(null),
  }),
  actions: {
    async addPost(formData: FormData) {
      try {
        const response = await api.post('/posts/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const newPost = response.data as PostWithAvatar;
        this.posts.unshift(newPost);
        Notify.create({
          color: 'positive',
          message: 'Post added',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async getPosts() {
      try {
        const response = await api.get('/posts/posts');
        this.posts = response.data as PostWithAvatar[];
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async downloadFile(fileId: number, fileName: string) {
      try {
        const response = await api.get(
          `/onedrive/files/post/download/${fileId}`,
          {
            responseType: 'blob',
          }
        );

        const blob = new Blob([response.data], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        Notify.create({
          color: 'positive',
          message: 'File downloaded',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async deleteFile(fileId: number) {
      try {
        await api.delete(`/onedrive/files/post/delete/${fileId}`);

        Notify.create({
          color: 'positive',
          message: 'File deleted',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    async deletePost(postId: number) {
      try {
        await api.delete(`/posts/delete/${postId}`);
        this.posts = this.posts.filter(post => post.id !== postId);
        Notify.create({
          color: 'positive',
          message: 'Post deleted',
          position: 'bottom',
          icon: 'check',
          textColor: 'black',
        });
      } catch (error : any) {
        Notify.create({
          color: 'negative',
          message: error.response.data.error,
          position: 'bottom',
          icon: 'report_problem',
        });
      }
    },

    getAvatarData(authorId: number): string | null {
      const post = this.posts.find((post: PostWithAvatar) => post.author.id === authorId);
      return post ? post.author.avatarData : null;
    }
  },
});
