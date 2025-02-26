import { api } from '../../boot/axios';
import { NotificationService } from './notificationService';
import { LoadingService } from './loadingService';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class ApiService {
  static async get<T>(
    url: string,
    showLoading = true,
    loadingMessage?: string
  ): Promise<ApiResponse<T>> {
    const fetchData = async () => {
      try {
        const response = await api.get<T>(url);
        return { success: true, data: response.data };
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'An error occurred';
        return { success: false, error: errorMsg };
      }
    };

    if (showLoading) {
      return await LoadingService.withLoading(
        fetchData,
        loadingMessage || 'Loading data...'
      );
    } else {
      return await fetchData();
    }
  }

  static async post<T>(
    url: string,
    data: any,
    showLoading = true,
    loadingMessage?: string,
    successMessage?: string
  ): Promise<ApiResponse<T>> {
    const postData = async () => {
      try {
        const response = await api.post<T>(url, data);
        if (successMessage) {
          NotificationService.success(successMessage);
        }
        return { success: true, data: response.data };
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'An error occurred';
        NotificationService.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    };

    if (showLoading) {
      return await LoadingService.withLoading(
        postData,
        loadingMessage || 'Saving data...'
      );
    } else {
      return await postData();
    }
  }

  static async put<T>(
    url: string,
    data: any,
    showLoading = true,
    loadingMessage?: string,
    successMessage?: string
  ): Promise<ApiResponse<T>> {
    const putData = async () => {
      try {
        const response = await api.put<T>(url, data);
        if (successMessage) {
          NotificationService.success(successMessage);
        }
        return { success: true, data: response.data };
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'An error occurred';
        NotificationService.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    };

    if (showLoading) {
      return await LoadingService.withLoading(
        putData,
        loadingMessage || 'Updating data...'
      );
    } else {
      return await putData();
    }
  }

  static async delete<T>(
    url: string,
    showLoading = true,
    loadingMessage?: string,
    successMessage?: string
  ): Promise<ApiResponse<T>> {
    const deleteData = async () => {
      try {
        const response = await api.delete<T>(url);
        if (successMessage) {
          NotificationService.success(successMessage);
        }
        return { success: true, data: response.data };
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'An error occurred';
        NotificationService.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    };

    if (showLoading) {
      return await LoadingService.withLoading(
        deleteData,
        loadingMessage || 'Deleting data...'
      );
    } else {
      return await deleteData();
    }
  }

  static async upload<T>(
    url: string,
    file: File,
    showLoading = true,
    loadingMessage?: string,
    successMessage?: string
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadFile = async () => {
      try {
        const response = await api.post<T>(url, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (successMessage) {
          NotificationService.success(successMessage);
        }
        return { success: true, data: response.data };
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'An error occurred';
        NotificationService.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    };

    if (showLoading) {
      return await LoadingService.withLoading(
        uploadFile,
        loadingMessage || 'Uploading file...'
      );
    } else {
      return await uploadFile();
    }
  }

  static async download(
    url: string,
    filename: string,
    showLoading = true,
    loadingMessage?: string
  ): Promise<void> {
    const downloadFile = async () => {
      try {
        const response = await api.get(url, {
          responseType: 'blob',
        });
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error: any) {
        const errorMsg = error.response?.data?.error || 'An error occurred';
        NotificationService.error(errorMsg);
      }
    };

    if (showLoading) {
      await LoadingService.withLoading(
        downloadFile,
        loadingMessage || 'Downloading file...'
      );
    } else {
      await downloadFile();
    }
  }
}
