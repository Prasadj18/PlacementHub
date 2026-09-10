import api from './axios';
import { DashboardData } from '../types';

export const dashboardApi = {
  get: () =>
    api.get<DashboardData>('/dashboard'),
};
