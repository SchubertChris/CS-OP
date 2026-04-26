/**
 * Haptic Feedback — Android (Vibration API) + iOS (AudioContext Trick)
 *
 * iOS: navigator.vibrate() wird von Safari nicht unterstützt.
 * Workaround: Kurzer stummer AudioContext-Ton triggert die Taptic Engine
 * auf neueren iPhones (ab iPhone 7, iOS 13+) wenn der User interagiert.
 *
 * Patterns (ms):
 *   light:   [10]          — leichter Tap (Button, Toggle, Chip)
 *   medium:  [30]          — normaler Tap (Action, Tab-Wechsel)
 *   heavy:   [60]          — starke Aktion (Delete, Submit)
 *   error:   [50, 40, 50]  — Fehler / Ablehnung / falsches TOTP
 *   success: [10, 20, 10]  — Erfolg / Bestätigung / Zahlung
 */

type HapticPattern = 'light' | 'medium' | 'heavy' | 'error' | 'success'

const PATTERNS: Record<HapticPattern, number[]> = {
  light:   [10],
  medium:  [30],
  heavy:   [60],
  error:   [50, 40, 50],
  success: [10, 20, 10],
}

let audioCtx: AudioContext | null = null

function triggerIOSHaptic() {
  try {
    if (!audioCtx) audioCtx = new AudioContext()
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.connect(gain)
    gain.connect(audioCtx.destination)
    gain.gain.value = 0 // still — kein hörbarer Ton
    osc.frequency.value = 1
    osc.start(audioCtx.currentTime)
    osc.stop(audioCtx.currentTime + 0.001)
  } catch {
    // AudioContext nicht verfügbar — kein Crash
  }
}

export function useHaptic() {
  const trigger = (pattern: HapticPattern = 'light') => {
    // Android / Chrome: Vibration API
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(PATTERNS[pattern])
      return
    }

    // iOS: AudioContext-Workaround
    // Funktioniert nur innerhalb eines User-Gesture-Handlers
    triggerIOSHaptic()
  }

  return { trigger }
}
