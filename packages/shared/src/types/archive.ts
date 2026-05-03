export type ArchiveCategory =
  | 'vertraege'
  | 'versicherungen'
  | 'legi'
  | 'karten'
  | 'rechnungen'
  | 'konten'
  | 'eingaenge'
  | 'fotos'
  | 'sonstiges'

export interface ArchiveDocument {
  id: string
  userId: string
  name: string
  category: ArchiveCategory
  fileUrl: string
  fileSize: number
  mimeType: string
  note: string | null
  expiryDate: string | null
  linkedLineItemId: string | null
  linkedAccountId: string | null
  uploadedAt: string
}

export type PostboxItemType = 'system' | 'bank' | 'insight' | 'alert' | 'reminder'

export interface PostboxItem {
  id: string
  userId: string
  type: PostboxItemType
  sender: string
  subject: string
  content: string
  actionUrl: string | null
  readAt: string | null
  archivedAt: string | null
  createdAt: string
}
