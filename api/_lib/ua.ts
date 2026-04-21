import { UAParser } from 'ua-parser-js'

export interface ParsedUA {
  device:  'mobile' | 'desktop' | 'tablet'
  browser: string
  os:      string
}

export function parseUA(userAgent: string | undefined): ParsedUA {
  if (!userAgent) return { device: 'desktop', browser: 'Unknown', os: 'Unknown' }

  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  const deviceType = result.device.type
  const device: ParsedUA['device'] =
    deviceType === 'mobile' ? 'mobile' :
    deviceType === 'tablet' ? 'tablet' : 'desktop'

  return {
    device,
    browser: result.browser.name ?? 'Unknown',
    os:      result.os.name     ?? 'Unknown',
  }
}
