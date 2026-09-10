import api from './axios';
import { Experience, CreateExperienceInput } from '../types';

export const experiencesApi = {
  getAll: (companyId?: string) =>
    api.get<Experience[]>('/experiences', { params: companyId ? { companyId } : {} }),

  create: (data: CreateExperienceInput) =>
    api.post<Experience>('/experiences', data),
};
