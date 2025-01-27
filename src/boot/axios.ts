import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/authStore';
import { useUserStore } from 'src/stores/userStore';
import { router } from 'src/router/index';
import { Loading } from 'quasar';
import config from 'src/config';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: config.backendUrl,
  withCredentials: true // Important for sending cookies
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (error.config && error.response && error.response.status === 401) {
        // If the request was for refresh token, logout and redirect to login page
        if (error.config.url === '/auth/refresh-token') {
          useAuthStore().logout();
          router.push('/login');
          return Promise.reject(error);
        }

        Loading.show({ message: 'Wait a moment please' });

        try {
          // The access token has expired, try refresh
          const refreshResponse = await api.post('/auth/refresh-token');

          if (refreshResponse.status === 200) {
            // Store new user info JWT
            localStorage.setItem('token', refreshResponse.data);
            // Update user info
            useUserStore().getUserInfo();
            Loading.hide();
            // Retry the original request
            return api.request(error.config);
          }
        } catch (refreshError) {
          // Refresh token is invalid
          useAuthStore().logout();
          router.push('/login');
          return Promise.reject(refreshError);
        }
      }
      return Promise.reject(error);
    } finally {
      Loading.hide();
    }
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
