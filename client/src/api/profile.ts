import api from './axios';
import { Profile } from '../types';

export const profileApi = {
  get: () =>
    api.get<Profile>('/profile'),

  update: (data: { name?: string; branch?: string; graduationYear?: number }) =>
    api.put<Profile>('/profile', data),
};
