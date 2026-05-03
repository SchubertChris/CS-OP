export interface User {
  id: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  createdAt: string
  verifiedAt: string | null
  deletedAt: string | null
}

export interface UserProfile {
  userId: string
  displayName: string
  avatarUrl: string | null
  zahltag: number
  currency: string
  locale: string
  theme: 'dark' | 'light' | 'system'
  notifications: import('./settings').NotificationSettings
}

export interface UserSession {
  id: string
  userId: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  os: string
  ipAddress: string
  lastSeenAt: string
  expiresAt: string
  trusted: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  requiresTwoFA: boolean
  sessionId: string | null
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
  acceptedTerms: boolean
  acceptedPrivacy: boolean
}

export interface TwoFASetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface TokenPayload {
  sub: string
  email: string
  sessionId: string
  twoFaVerified: boolean
  iat: number
  exp: number
}
