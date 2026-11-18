import type { Visit } from './WeekCalendar'

type BackendVisit = {
  id: string
  startAt: string
  endAt: string
  status: string
  property_id: string
  properties: { title: string; city: string; address: string | null }
  leads: { budget: string | null; notes: string | null; visitors: { name: string | null; phone: string | null } }
  users: { first_name: string | null; last_name: string | null }
}

export function calendarVisit(row: BackendVisit, weekStart: Date): Visit {
  const start = new Date(row.startAt)
  // Calendar columns and labels use the agency's timezone.
  const local = new Date(start.toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }))
  const midnight = new Date(local.getFullYear(), local.getMonth(), local.getDate())
  const day = Math.round((midnight.getTime() - weekStart.getTime()) / 86400000)
  const name = row.leads.visitors.name || row.leads.visitors.phone || 'Customer'
  return {
    id: row.id, startsAt: row.startAt, propertyId: row.property_id,
    day, start: local.getHours() + local.getMinutes() / 60,
    duration: (new Date(row.endAt).getTime() - start.getTime()) / 3600000,
    title: row.properties.title, client: name, fullName: name,
    phone: row.leads.visitors.phone || '—', status: row.status.toUpperCase(),
    location: row.properties.city, address: row.properties.address || '—',
    budget: row.leads.budget ? row.leads.budget + ' MAD' : '—',
    note: row.leads.notes || '',
    assignedAgent: [row.users.first_name, row.users.last_name].filter(Boolean).join(' '),
  }
}
