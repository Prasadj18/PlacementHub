import api from './axios';
import { AuthResponse, LoginInput, RegisterInput, User } from '../types';

export const authApi = {
  register: (data: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', data),

  login: (data: LoginInput) =>
    api.post<AuthResponse>('/auth/login', data),

  me: () =>
    api.get<User>('/auth/me'),
};
