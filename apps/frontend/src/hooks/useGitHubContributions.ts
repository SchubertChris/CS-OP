/* ============================================================
   CandleScope — GitHub Contributions Hook
   src/hooks/useGitHubContributions.ts

   Nutzt: https://github-contributions-api.jogruber.de/v4/:user
   Kein Token nötig — öffentliche API.
   ============================================================ */
import { useEffect, useState } from 'react'

export interface ContributionDay {
  date: string          // "2024-03-01"
  count: number
  level: 0 | 1 | 2 | 3 | 4
}

export interface GitHubContributions {
  total: Record<string, number>   // { "2024": 412, "2025": 380 }
  contributions: ContributionDay[]
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function useGitHubContributions(username: string) {
  const [data, setData] = useState<GitHubContributions | null>(null)
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => {
    if (!username) return
    setStatus('loading')

    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<GitHubContributions>
      })
      .then((json) => {
        setData(json)
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [username])

  return { data, status }
}