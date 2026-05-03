import type { Transaction } from '../types/transactions'
import type {
  TransactionCreateRequest,
  UmbuchungCreateRequest,
  DauerauftragCreateRequest,
} from '../types/transactions'
import type { ApiResponse, PaginatedResponse } from '../types/api'
import { apiRequest } from './client'

export interface TransactionFilters {
  accountId?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  type?: 'einnahme' | 'ausgabe'
  search?: string
  page?: number
  pageSize?: number
}

export const transactionsApi = {
  list: (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v != null) params.set(k, String(v))
    })
    return apiRequest<PaginatedResponse<Transaction>>(`/transactions?${params}`)
  },

  get: (id: string) =>
    apiRequest<ApiResponse<Transaction>>(`/transactions/${id}`),

  create: (data: TransactionCreateRequest) =>
    apiRequest<ApiResponse<Transaction>>('/transactions', { method: 'POST', body: data }),

  createTransfer: (data: UmbuchungCreateRequest) =>
    apiRequest<ApiResponse<Transaction>>('/transactions/transfer', { method: 'POST', body: data }),

  createDauerauftrag: (data: DauerauftragCreateRequest) =>
    apiRequest<ApiResponse<Transaction>>('/transactions/dauerauftrag', { method: 'POST', body: data }),

  update: (id: string, data: Partial<Transaction>) =>
    apiRequest<ApiResponse<Transaction>>(`/transactions/${id}`, { method: 'PATCH', body: data }),

  delete: (id: string) =>
    apiRequest<ApiResponse<null>>(`/transactions/${id}`, { method: 'DELETE' }),

  bulkCategorize: (ids: string[], categoryId: string) =>
    apiRequest<ApiResponse<null>>('/transactions/bulk/categorize', {
      method: 'POST',
      body: { ids, categoryId },
    }),
}
