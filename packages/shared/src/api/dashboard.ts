import type { NetWorthSnapshot, MonthlySummary, SmartInsight, YearAnalytics } from '../types/analytics'
import type { ApiResponse } from '../types/api'
import { apiRequest } from './client'

export const dashboardApi = {
  netWorthHistory: (months = 12) =>
    apiRequest<ApiResponse<NetWorthSnapshot[]>>(`/dashboard/networth?months=${months}`),

  monthlySummary: (monthKey: string) =>
    apiRequest<ApiResponse<MonthlySummary>>(`/dashboard/monthly/${monthKey}`),

  currentMonth: () =>
    apiRequest<ApiResponse<MonthlySummary>>('/dashboard/monthly/current'),

  insights: () =>
    apiRequest<ApiResponse<SmartInsight[]>>('/dashboard/insights'),

  yearAnalytics: (year: number) =>
    apiRequest<ApiResponse<YearAnalytics>>(`/dashboard/analytics/${year}`),

  dismissInsight: (id: string) =>
    apiRequest<ApiResponse<null>>(`/dashboard/insights/${id}/dismiss`, { method: 'POST' }),
}
