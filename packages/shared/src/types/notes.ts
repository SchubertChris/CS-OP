export type FNPView = 'notes' | 'faq' | 'calc'

export interface Note {
  id:      number
  title:   string
  content: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface NoteRecord {
  id:        string
  userId:    string
  title:     string
  content:   string
  createdAt: string
  updatedAt: string
}

export interface NoteCreateInput {
  title:    string
  content?: string
}

export interface NoteUpdateInput {
  title?:   string
  content?: string
}
