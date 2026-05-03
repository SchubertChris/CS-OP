export interface UserDevice {
  id: string
  userId: string
  deviceName: string
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown'
  browser: string
  os: string
  lastSeenAt: string
  lastIpAnonymized: string
  trusted: boolean
  isCurrentDevice: boolean
  createdAt: string
}
