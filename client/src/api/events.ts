import api from './axios';
import { Event, CreateEventInput } from '../types';
import { localDateTimeToUtcISOString } from '../utils/dateTime';

function normalizeEventDateTime<T extends { dateTime?: string }>(data: T): T {
  return data.dateTime
    ? { ...data, dateTime: localDateTimeToUtcISOString(data.dateTime) }
    : data;
}

export const eventsApi = {
  getAll: (companyId?: string) =>
    api.get<Event[]>('/events', { params: companyId ? { companyId } : {} }),

  getById: (id: string) =>
    api.get<Event>('/events/' + id),

  create: (data: CreateEventInput) =>
    api.post<Event>('/events', normalizeEventDateTime(data)),

  update: (id: string, data: Partial<CreateEventInput>) =>
    api.put<Event>('/events/' + id, normalizeEventDateTime(data)),

  delete: (id: string) =>
    api.delete('/events/' + id),
};
