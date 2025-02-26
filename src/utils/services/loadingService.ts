import { Loading } from 'quasar';

export interface LoadingOptions {
  message?: string;
  spinnerSize?: number;
  spinnerColor?: string;
  messageColor?: string;
  backgroundColor?: string;
  boxClass?: string;
  customClass?: string;
}

export class LoadingService {
  static defaultOptions: LoadingOptions = {
    spinnerColor: 'amber',
    messageColor: 'amber',
    backgroundColor: 'black',
  };

  static show(message = 'Loading...', options: LoadingOptions = {}) {
    Loading.show({
      ...this.defaultOptions,
      ...options,
      message,
    });
  }

  static hide() {
    Loading.hide();
  }

  static async withLoading<T>(
    fn: () => Promise<T>,
    message = 'Loading...',
    options: LoadingOptions = {}
  ): Promise<T> {
    this.show(message, options);
    try {
      return await fn();
    } finally {
      this.hide();
    }
  }
}
