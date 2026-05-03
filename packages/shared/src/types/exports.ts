export type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'json' | 'elster_xml'
export type ExportScope  = 'transactions' | 'accounts' | 'goals' | 'full' | 'tax_year'

export interface ExportRequest {
  format: ExportFormat
  scope: ExportScope
  filters: {
    dateFrom?: string
    dateTo?: string
    accountIds?: string[]
    categoryIds?: string[]
  }
  includeAttachments: boolean
}

export interface ExportJob {
  id: string
  userId: string
  request: ExportRequest
  status: 'queued' | 'processing' | 'ready' | 'failed'
  fileUrl: string | null
  fileSizeBytes: number | null
  expiresAt: string | null
  createdAt: string
  completedAt: string | null
  errorMessage: string | null
}

export interface SharedReport {
  id: string
  userId: string
  title: string
  scope: ExportScope
  dateFrom: string
  dateTo: string
  accessToken: string
  expiresAt: string
  viewedAt: string | null
  createdAt: string
}
