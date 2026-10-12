import { useQuery } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export function useVisits(weekStart: Date, weekEnd: Date) {
  return useQuery({
    queryKey: ['visits', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: async () => {
      const res = await fetch(
        `${API_BASE}/visits?from=${weekStart.toISOString()}&to=${weekEnd.toISOString()}`,
        { credentials: 'include' }
      )
      if (!res.ok) throw new Error('Failed to fetch visits')
      return res.json()
    },
  })
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/agents`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch agents')
      return res.json()
    },
  })
}

export function useAgencySettings() {
  return useQuery({
    queryKey: ['agency-settings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/agency/settings`, { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to fetch settings')
      return res.json()
    },
  })
}