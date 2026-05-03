export type BankImportFormat =
  | 'dkb_csv'
  | 'sparkasse_csv'
  | 'comdirect_csv'
  | 'n26_csv'
  | 'ing_csv'
  | 'volksbank_csv'
  | 'postbank_csv'
  | 'paypal_csv'
  | 'generic_csv'

export interface ImportSession {
  id: string
  userId: string
  accountId: string
  format: BankImportFormat
  status: 'preview' | 'mapping' | 'processing' | 'completed' | 'failed'
  fileName: string
  totalRows: number
  importedRows: number
  skippedRows: number
  errorRows: number
  preview: ImportedTransaction[]
  createdAt: string
}

export interface ImportedTransaction {
  rowIndex: number
  date: string
  name: string
  amount: number
  balance: number | null
  rawIban: string | null
  suggestedCategoryId: string | null
  isDuplicate: boolean
  duplicateOfId: string | null
}

export interface DuplicateCheck {
  importedTx: ImportedTransaction
  existingTxId: string
  similarity: number
  matchFields: Array<'date' | 'amount' | 'name' | 'iban'>
}
