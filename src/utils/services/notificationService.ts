import { Notify, QNotifyOptions } from 'quasar';

export const NotificationType = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

export class NotificationService {
  static show(type: string, message: string, options: Partial<QNotifyOptions> = {}) {
    const defaultOptions: Record<string, Partial<QNotifyOptions>> = {
      [NotificationType.SUCCESS]: {
        color: 'positive',
        icon: 'check',
        position: 'bottom',
        textColor: 'black',
      },
      [NotificationType.ERROR]: {
        color: 'negative',
        icon: 'report_problem',
        position: 'bottom',
      },
      [NotificationType.WARNING]: {
        color: 'warning',
        icon: 'warning',
        position: 'bottom',
      },
      [NotificationType.INFO]: {
        color: 'info',
        icon: 'info',
        position: 'bottom',
      }
    };

    const notifyOptions = {
      ...defaultOptions[type],
      ...options,
      message
    };

    Notify.create(notifyOptions);
  }

  static success(message: string, options: Partial<QNotifyOptions> = {}) {
    this.show(NotificationType.SUCCESS, message, options);
  }

  static error(message: string, options: Partial<QNotifyOptions> = {}) {
    this.show(NotificationType.ERROR, message, options);
  }

  static warning(message: string, options: Partial<QNotifyOptions> = {}) {
    this.show(NotificationType.WARNING, message, options);
  }

  static info(message: string, options: Partial<QNotifyOptions> = {}) {
    this.show(NotificationType.INFO, message, options);
  }
}
