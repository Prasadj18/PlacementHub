import api from './axios';
import { Notification } from '../types';

export const notificationsApi = {
  getAll: () =>
    api.get<Notification[]>('/notifications'),

  markAsRead: (id: string) =>
    api.patch<Notification>('/notifications/' + id + '/read'),

  markAllAsRead: () =>
    api.patch('/notifications/read-all'),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread-count'),
};
