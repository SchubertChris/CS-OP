export interface Schuld {
  id: string
  userId: string
  bezeichnung: string
  typ: 'ratenkredit' | 'dispo' | 'kreditkarte' | 'privatkredit' | 'sonstiges'
  restschuld: number
  zinssatz: number
  minMonatlicheRate: number
  aktuellMonatlicheRate: number
  linkedAccountId: string | null
}

export type TilgungsMethode = 'schneeball' | 'lawine'

export interface TilgungsplanEintrag {
  monat: number
  schuldId: string
  restschuld: number
  zahlung: number
  tilgung: number
  zinsen: number
  restschuldEnde: number
}

export interface Entschuldungsplan {
  userId: string
  methode: TilgungsMethode
  monatlichesExtrabudget: number
  schulden: Schuld[]
  plan: TilgungsplanEintrag[]
  schuldenfrei_datum: string
  gesamtzinsen: number
  ersparnis_vs_minimum: number
}
