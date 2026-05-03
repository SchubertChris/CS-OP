import type { User, LoginRequest, RegisterRequest, TwoFASetup } from '../types/auth'
import type { ApiResponse } from '../types/api'
import { apiRequest } from './client'

export const authApi = {
  login: (data: LoginRequest) =>
    apiRequest<ApiResponse<{ requiresTwoFA: boolean }>>('/auth/login', {
      method: 'POST',
      body: data,
    }),

  register: (data: RegisterRequest) =>
    apiRequest<ApiResponse<User>>('/auth/register', { method: 'POST', body: data }),

  logout: () =>
    apiRequest<ApiResponse<null>>('/auth/logout', { method: 'POST' }),

  me: () =>
    apiRequest<ApiResponse<User>>('/auth/me'),

  verifyEmail: (token: string) =>
    apiRequest<ApiResponse<null>>(`/auth/verify-email?token=${token}`),

  forgotPassword: (email: string) =>
    apiRequest<ApiResponse<null>>('/auth/forgot-password', { method: 'POST', body: { email } }),

  resetPassword: (token: string, newPassword: string) =>
    apiRequest<ApiResponse<null>>('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    }),

  setup2FA: () =>
    apiRequest<ApiResponse<TwoFASetup>>('/auth/2fa/setup'),

  confirm2FA: (code: string) =>
    apiRequest<ApiResponse<null>>('/auth/2fa/confirm', { method: 'POST', body: { code } }),

  verify2FA: (code: string) =>
    apiRequest<ApiResponse<{ accessToken: string }>>('/auth/2fa/verify', {
      method: 'POST',
      body: { code },
    }),

  disable2FA: (password: string) =>
    apiRequest<ApiResponse<null>>('/auth/2fa', { method: 'DELETE', body: { password } }),
}
