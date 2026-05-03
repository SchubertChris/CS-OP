export interface AfaEntry {
  id: string
  userId: string
  name: string
  purchaseDate: string
  purchasePrice: number
  usefulLifeYears: number
  annualDeduction: number
  remainingValue: number
  businessUsePercent: number
  category: 'edv' | 'fahrzeug' | 'bueromoebel' | 'sonstiges'
  linkedTransactionId: string | null
}

export interface TaxYearSummary {
  userId: string
  year: number
  kapitalertraege: {
    dividenden: number
    kursgewinne: number
    zinsen: number
    freistellungsauftrag: number
    steuerpflichtig: number
    abgeltungssteuer: number
  }
  verlustverrechnungstopf: {
    aktien: number
    sonstige: number
  }
  werbungskosten: {
    homeoffice: number
    fahrkosten: number
    fortbildung: number
    arbeitsmittel: number
    sonstiges: number
    summe: number
  }
  afa: AfaEntry[]
  createdAt: string
}

export interface TaxExport {
  userId: string
  year: number
  format: 'pdf' | 'elster_xml' | 'csv'
  sections: Array<'kapitalertraege' | 'werbungskosten' | 'afa' | 'vermietung'>
  generatedAt: string
  fileUrl: string
}

export interface ElsterKapitalertraege {
  zeile12_dividenden: number
  zeile13_zinsen: number
  zeile14_kursgewinne: number
  zeile15_verluste: number
  zeile16_freistellungsauftrag: number
  zeile41_auslaendischeKapitalertraege: number
}
