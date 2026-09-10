import api from './axios';
import { Company, CompanyDetail, CreateCompanyInput } from '../types';

export const companiesApi = {
  getAll: () =>
    api.get<Company[]>('/companies'),

  getById: (id: string) =>
    api.get<CompanyDetail>('/companies/' + id),

  create: (data: CreateCompanyInput) =>
    api.post<{ company: Company; application: any }>('/companies', data),

  update: (id: string, data: Partial<CreateCompanyInput>) =>
    api.put<Company>('/companies/' + id, data),

  delete: (id: string) =>
    api.delete('/companies/' + id),
};
