import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export interface Review {
  id:        string
  name:      string
  role:      string
  stars:     number   // 1–5
  text:      string
  createdAt: string   // ISO
  status:    'pending' | 'approved' | 'rejected'
}

interface ReviewStore {
  reviews: Review[]
  /** Visitor submits — stored as pending */
  submit:  (data: Omit<Review, 'id' | 'createdAt' | 'status'>) => void
  /** Admin: approve pending */
  approve: (id: string) => void
  /** Admin: reject pending */
  reject:  (id: string) => void
  /** Admin: delete any review */
  remove:  (id: string) => void
  /** Admin: manually add as approved (e.g. from email) */
  add:     (data: Omit<Review, 'id' | 'createdAt' | 'status'>) => void
}

const SEED: Review[] = [
  {
    id: 'seed-1', name: 'Sento', role: 'Trader & Community', stars: 5,
    text: 'Die Jahresanalyse mit den Candlesticks — hab ich Chris direkt geschrieben. Sieht aus wie ein richtiges Trading-Terminal, nur für den eigenen Haushalt. Verwende es jeden Monat.',
    createdAt: '2026-01-15T10:00:00Z', status: 'approved',
  },
  {
    id: 'seed-2', name: 'DoctorHinky', role: 'Community Member', stars: 5,
    text: "Hab's ehrlich nur installiert weil Chris es gebaut hat — aber dann hab ich gemerkt dass ich endlich weiß wo mein Geld bleibt. Kein Abo, läuft offline, null Drama. Läuft.",
    createdAt: '2026-01-20T14:00:00Z', status: 'approved',
  },
  {
    id: 'seed-3', name: 'Sandra', role: 'Freundin & Testerin', stars: 5,
    text: 'Ich versteh nicht alles davon aber allein die Vertragsübersicht hat sich gelohnt — endlich alle Abos auf einen Blick. Und wenn man nicht weiterkommt hilft Chris einfach.',
    createdAt: '2026-02-01T09:00:00Z', status: 'approved',
  },
]

export const useReviewStore = create<ReviewStore>()(
  devtools(
    persist(
      (set) => ({
        reviews: SEED,

        submit: (data) => set(
          state => ({
            reviews: [
              ...state.reviews,
              { id: `review-${nanoid(8)}`, ...data, createdAt: new Date().toISOString(), status: 'pending' },
            ],
          }),
          false, 'submit'
        ),

        approve: (id) => set(
          state => ({ reviews: state.reviews.map(r => r.id === id ? { ...r, status: 'approved' } : r) }),
          false, 'approve'
        ),

        reject: (id) => set(
          state => ({ reviews: state.reviews.map(r => r.id === id ? { ...r, status: 'rejected' } : r) }),
          false, 'reject'
        ),

        remove: (id) => set(
          state => ({ reviews: state.reviews.filter(r => r.id !== id) }),
          false, 'remove'
        ),

        add: (data) => set(
          state => ({
            reviews: [
              ...state.reviews,
              { id: `review-${nanoid(8)}`, ...data, createdAt: new Date().toISOString(), status: 'approved' },
            ],
          }),
          false, 'add'
        ),
      }),
      {
        name: 'cs-reviews-v1',
        partialize: (state) => ({ reviews: state.reviews }),
      }
    ),
    { name: 'ReviewStore' }
  )
)
