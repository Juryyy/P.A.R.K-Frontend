// src/stores/postStore.ts
import { defineStore } from 'pinia';
import { api } from '../boot/axios';
import { ref } from 'vue';
import { PostWithAvatar } from 'src/db/types';

export interface PostResult {
  success: boolean;
  data?: any;
  error?: string;
}

export const usePostStore = defineStore('post', {
  state: () => ({
    posts: ref<PostWithAvatar[]>([]),
    newPost: ref<PostWithAvatar | null>(null),
  }),
  actions: {
    async addPost(formData: FormData): Promise<PostResult> {
      try {
        const response = await api.post('/posts/create', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const newPost = response.data as PostWithAvatar;
        this.posts.unshift(newPost);
        return { success: true, data: newPost };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to add post',
        };
      }
    },

    async getPosts(): Promise<PostResult> {
      try {
        const response = await api.get('/posts/posts');
        this.posts = response.data as PostWithAvatar[];
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to get posts',
        };
      }
    },

    async downloadFile(fileId: number, fileName: string): Promise<PostResult> {
      try {
        const response = await api.get(
          `/onedrive/files/post/download/${fileId}`,
          {
            responseType: 'blob',
          }
        );

        const blob = new Blob([response.data], {
          type: 'application/octet-stream',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to download file',
        };
      }
    },

    async deleteFile(fileId: number): Promise<PostResult> {
      try {
        const response = await api.delete(
          `/onedrive/files/post/delete/${fileId}`
        );
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to delete file',
        };
      }
    },

    async deletePost(postId: number): Promise<PostResult> {
      try {
        const response = await api.delete(`/posts/delete/${postId}`);
        this.posts = this.posts.filter((post) => post.id !== postId);
        return { success: true, data: response.data };
      } catch (error: any) {
        return {
          success: false,
          error: error.response?.data?.error || 'Failed to delete post',
        };
      }
    },

    getAvatarData(authorId: number): string | null {
      const post = this.posts.find(
        (post: PostWithAvatar) => post.author.id === authorId
      );
      return post ? post.author.avatarData : null;
    },
  },
});
