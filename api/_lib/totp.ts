import { authenticator } from 'otplib'

authenticator.options = { window: 1 }

export function generateSecret(): string {
  return authenticator.generateSecret(20)
}

export function generateOtpAuthUrl(secret: string, account: string, issuer: string): string {
  return authenticator.keyuri(account, issuer, secret)
}

export function verifyTotp(token: string, secret: string): boolean {
  try {
    return authenticator.verify({ token, secret })
  } catch {
    return false
  }
}
