export interface RiesterVertrag {
  id: string
  userId: string
  anbieter: string
  vertragsnummer: string | null
  jahresbeitrag: number
  grundzulage: number
  kinderzulage: number
  kinderAnzahl: number
  steuerersparnis: number
  currentValue: number
  rendite: number
  ablaufjahr: number
  linkedAccountId: string | null
}

export interface RuerupVertrag {
  id: string
  userId: string
  anbieter: string
  jahresbeitrag: number
  maxAbzugsfaehig: number
  steuerersparnis: number
  currentValue: number
  rendite: number
  ablaufjahr: number
}

export interface BavVertrag {
  id: string
  userId: string
  arbeitgeber: string
  entgeltumwandlung: number
  arbeitgeberzuschuss: number
  currentValue: number
  rendite: number
  unverfallbarkeitsdatum: string | null
}

export interface VlVertrag {
  id: string
  userId: string
  anbieter: string
  fondName: string
  isin: string | null
  monatsbeitrag: number
  arbeitgeberbeitrag: number
  sperrfrist: string
  currentValue: number
  linkedAccountId: string | null
}

export interface RentenlueckenAnalyse {
  userId: string
  calculatedAt: string
  renteneintrittAlter: number
  geplanterMonatsbedarf: number
  gesetzlicheRente: number
  privateVorsorge: number
  luecke: number
  deckungsgrad: number
  empfehlungen: string[]
}
