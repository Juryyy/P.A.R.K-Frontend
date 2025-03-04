import { ref, computed } from 'vue';
import { usePostStore } from 'src/stores/postStore';
import { NotificationService } from 'src/utils/services/notificationService';
import { LoadingService } from 'src/utils/services/loadingService';
import { PostWithAvatar } from 'src/db/types';

export function usePost() {
  const postStore = usePostStore();
  const loading = ref(false);

  const posts = computed(() => postStore.posts);

  const addPost = async (formData: FormData): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await postStore.addPost(formData);

        if (result.success) {
          NotificationService.success('Post added successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to add post');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while adding the post');
        return false;
      }
    }, 'Adding post...');
  };

  const getPosts = async (): Promise<PostWithAvatar[] | null> => {
    loading.value = true;
    try {
      const result = await postStore.getPosts();

      if (result.success) {
        return result.data;
      } else {
        NotificationService.error(result.error || 'Failed to get posts');
        return null;
      }
    } catch (error) {
      NotificationService.error('An error occurred while fetching posts');
      return null;
    } finally {
      loading.value = false;
    }
  };

  const downloadFile = async (
    fileId: number,
    fileName: string
  ): Promise<boolean> => {
    loading.value = true;
    try {
      const result = await postStore.downloadFile(fileId, fileName);

      if (result.success) {
        NotificationService.success('File downloaded successfully');
        return true;
      } else {
        NotificationService.error(result.error || 'Failed to download file');
        return false;
      }
    } catch (error) {
      NotificationService.error('An error occurred while downloading the file');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteFile = async (fileId: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await postStore.deleteFile(fileId);

        if (result.success) {
          NotificationService.success('File deleted successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to delete file');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while deleting the file');
        return false;
      }
    }, 'Deleting file...');
  };

  const deletePost = async (postId: number): Promise<boolean> => {
    return await LoadingService.withLoading(async () => {
      try {
        const result = await postStore.deletePost(postId);

        if (result.success) {
          NotificationService.success('Post deleted successfully');
          return true;
        } else {
          NotificationService.error(result.error || 'Failed to delete post');
          return false;
        }
      } catch (error) {
        NotificationService.error('An error occurred while deleting the post');
        return false;
      }
    }, 'Deleting post...');
  };

  const getAvatarData = (authorId: number): string | null => {
    return postStore.getAvatarData(authorId);
  };

  return {
    loading,
    posts,
    addPost,
    getPosts,
    downloadFile,
    deleteFile,
    deletePost,
    getAvatarData,
  };
}
