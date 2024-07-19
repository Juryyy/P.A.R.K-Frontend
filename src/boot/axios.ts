import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/authStore';
import { router } from 'src/router/index';
import { Loading } from 'quasar';
import config from 'src/config';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({ baseURL: config.backendUrl, withCredentials: true });

api.interceptors.response.use(undefined, async error => {
  if (error.config && error.response && error.response.status === 401) {
    // If the request was for refresh token, logout and redirect to login page
    if (error.config.url === '/auth/refresh-token') {
      useAuthStore().logout();
      router.push('/login');
      return Promise.reject(error);
    }
    Loading.show({message :'Wait a moment please'})
    // The access token has expired, refresh it
    const refreshResponse = await api.post('/auth/refresh-token');

    if (refreshResponse.status === 200) {
      useAuthStore().setUserInfo(refreshResponse.data);
    Loading.hide()
      // Retry the original request. The browser will include the new access token in the request headers.
      return api.request(error.config);
    }

    // The refresh token is also invalid, redirect to login page
    useAuthStore().logout();
    router.push('/login');
    Loading.hide()
  }
  console.log('Axios: ', Promise.reject(error));
  return Promise.reject(error);
});

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
