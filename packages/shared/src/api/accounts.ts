import type { Account, BankGroup } from '../types/accounts'
import type { ApiResponse } from '../types/api'
import { apiRequest } from './client'

export const accountsApi = {
  list: () =>
    apiRequest<ApiResponse<Account[]>>('/accounts'),

  listGrouped: () =>
    apiRequest<ApiResponse<BankGroup[]>>('/accounts/grouped'),

  get: (id: string) =>
    apiRequest<ApiResponse<Account>>(`/accounts/${id}`),

  create: (data: Omit<Account, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    apiRequest<ApiResponse<Account>>('/accounts', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Account>) =>
    apiRequest<ApiResponse<Account>>(`/accounts/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    apiRequest<ApiResponse<null>>(`/accounts/${id}`, { method: 'DELETE' }),

  archive: (id: string) =>
    apiRequest<ApiResponse<Account>>(`/accounts/${id}/archive`, { method: 'POST' }),
}
