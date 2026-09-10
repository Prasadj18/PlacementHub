import api from './axios';
import { Application, ApplicationStatus } from '../types';

export const applicationsApi = {
  getAll: () =>
    api.get<Application[]>('/applications'),

  create: (companyId: string) =>
    api.post<Application>('/applications', { companyId }),

  updateStatus: (id: string, status: ApplicationStatus) =>
    api.patch<Application>('/applications/' + id, { status }),
};
