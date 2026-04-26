import { type RefObject, useEffect, useRef } from 'react'

interface Options {
  /** Hook aktiv oder nicht — z.B. deaktivieren wenn Modal zu ist */
  enabled?: boolean
  /** Escape-Taste schließt ebenfalls */
  closeOnEscape?: boolean
}

/**
 * Schließt Modals/Dropdowns NUR wenn pointerdown UND pointerup
 * beide außerhalb des Ref-Elements lagen.
 *
 * Problem das damit gelöst wird:
 * User markiert Text in einem Input → zieht Cursor nach außen → lässt los
 * → normaler "click outside" würde das Modal schließen → das ist falsch.
 *
 * Mit dieser Hook: pointerdown war INNEN (im Input) → kein Schließen.
 */
export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: () => void,
  options: Options = {},
) {
  const { enabled = true, closeOnEscape = true } = options

  // Ref statt State — kein Re-Render beim Tracking
  const downWasOutside = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const onPointerDown = (e: PointerEvent) => {
      downWasOutside.current = !ref.current?.contains(e.target as Node)
    }

    const onPointerUp = (e: PointerEvent) => {
      const upIsOutside = !ref.current?.contains(e.target as Node)
      if (downWasOutside.current && upIsOutside) {
        handler()
      }
      downWasOutside.current = false
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.stopPropagation()
        handler()
      }
    }

    // Capture-Phase: greift vor React's synthetischen Events
    document.addEventListener('pointerdown', onPointerDown, { capture: true })
    document.addEventListener('pointerup', onPointerUp, { capture: true })
    document.addEventListener('keydown', onKeyDown, { capture: true })

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, { capture: true })
      document.removeEventListener('pointerup', onPointerUp, { capture: true })
      document.removeEventListener('keydown', onKeyDown, { capture: true })
    }
  }, [ref, handler, enabled, closeOnEscape])
}
