import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/authStore';
import { useUserStore } from 'src/stores/userStore';
import { router } from 'src/router/index';
import { Loading, Notify } from 'quasar';
import config from 'src/config';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL: config.backendUrl,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    try {
      if (error.response && error.response.status === 429) {
        Notify.create({
          color: 'negative',
          message: 'Too many requests. Please try again later.',
          position: 'bottom',
          icon: 'report_problem',
        });
        return Promise.reject(error);
      }

      if (error.config && error.response && error.response.status === 401) {
        if (error.config.url === '/auth/refresh-tokens') {
          useAuthStore().logout();
          router.push('/login');
          return Promise.reject(error);
        }

        Loading.show({ message: 'Wait a moment please' });

        try {
          const refreshResponse = await api.post('/auth/refresh-tokens');

          if (refreshResponse.status === 200) {
            localStorage.setItem('token', refreshResponse.data);
            useUserStore().getUserInfo();
            Loading.hide();
            return api.request(error.config);
          }
        } catch (refreshError) {
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
