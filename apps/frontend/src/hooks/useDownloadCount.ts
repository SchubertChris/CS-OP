// src/hooks/useDownloadCount.ts
import { useEffect, useState } from 'react'

const REPO = 'SchubertChris/CS-OP'
const API  = `https://api.github.com/repos/${REPO}/releases`

export function useDownloadCount(): number | null {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch(API, { headers: { Accept: 'application/vnd.github+json' } })
      .then(r => r.json())
      .then((releases: { assets: { download_count: number }[] }[]) => {
        const total = releases.reduce((sum, rel) =>
          sum + rel.assets.reduce((s, a) => s + a.download_count, 0), 0)
        setCount(total)
      })
      .catch(() => setCount(null))
  }, [])

  return count
}
