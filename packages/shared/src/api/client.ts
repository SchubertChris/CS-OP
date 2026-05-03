import type { ApiError } from '../types/api'

const BASE_URL = '/api/financehub'

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
}

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: 'INTERNAL_ERROR' as const,
      message: `HTTP ${response.status}`,
    })) as ApiError
    throw new ApiRequestError(error.code, error.message, response.status, error.details)
  }

  return response.json() as Promise<T>
}
