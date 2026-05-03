export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiError {
  code: ApiErrorCode
  message: string
  details?: Record<string, string[]>
}

export type FormErrors<T> = Partial<Record<keyof T, string>>

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'TOKEN_EXPIRED'
  | 'TWO_FA_REQUIRED'
  | 'TWO_FA_INVALID'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_DELETED'
  | 'ACCOUNT_LOCKED'
  | 'NOT_FOUND'
  | 'ALREADY_EXISTS'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'INVALID_AMOUNT'
  | 'INVALID_DATE'
  | 'INVALID_IBAN'
  | 'RATE_LIMITED'
  | 'QUOTA_EXCEEDED'
  | 'BANKING_CONNECTION_FAILED'
  | 'BANKING_CONSENT_EXPIRED'
  | 'BANKING_SYNC_IN_PROGRESS'
  | 'IMPORT_FORMAT_UNKNOWN'
  | 'IMPORT_FILE_TOO_LARGE'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'MAINTENANCE'
