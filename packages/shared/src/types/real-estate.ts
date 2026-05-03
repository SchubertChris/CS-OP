export interface ImmobilieAsset {
  id: string
  userId: string
  bezeichnung: string
  typ: 'eigentumswohnung' | 'haus' | 'grundstueck' | 'gewerbe'
  kaufdatum: string
  kaufpreis: number
  kaufnebenkosten: number
  aktuellerMarktwert: number
  wohnflaeche: number
  address: {
    strasse: string
    plz: string
    ort: string
  }
  hypothekIds: string[]
  vermietet: boolean
  monatlicheMiete: number | null
  linkedAccountId: string | null
  updatedAt: string
}

export interface Hypothek {
  id: string
  userId: string
  immobilieId: string
  bank: string
  darlehensbetrag: number
  restschuld: number
  zinssatz: number
  zinsbindungBis: string
  monatlicheRate: number
  tilgungsanteil: number
  zinsanteil: number
  sondertilgungsrecht: number
  laufzeitEnde: string
}

export interface KaufenMietenVergleich {
  userId: string
  calculatedAt: string
  input: {
    kaufpreis: number
    eigenkapital: number
    zinssatz: number
    tilgung: number
    instandhaltungProJahr: number
    wertsteigerungProJahr: number
    alternativeMiete: number
    anlagezinsAlternative: number
    zeitraumJahre: number
  }
  result: {
    monatlicheKaufkosten: number
    monatlicheMietkosten: number
    breakEvenJahr: number | null
    gesamtkostenKauf: number
    gesamtkostenMiete: number
    empfehlung: 'kaufen' | 'mieten' | 'neutral'
    hinweis: string
  }
}
