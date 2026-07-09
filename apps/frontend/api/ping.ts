import type { VercelRequest, VercelResponse } from '@vercel/node'

// Reiner Health-Check. Verrät bewusst KEINEN Konfig-Zustand mehr
// (früheres hasDb/hasSetupToken war ein Aufklärungspfad für Angreifer).
export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({ ok: true, ts: Date.now() })
}
