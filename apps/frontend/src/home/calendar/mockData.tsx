import type { Visit } from './WeekCalendar'

// ============================================================
// MOCK DATA — temporary, until the Booking Service backend exists.
// Every array here mirrors the shape a real API response would have.
// When the backend is ready, replace the imports of this file with
// fetch() calls (see comments below each export).
// ============================================================

// Later: GET /api/visits
export const initialVisits: Visit[] = [
  {
    id: "v1", day: 0, start: 10, duration: 1.5,
    title: "Villa Atlas", client: "Karim El...", status: "CONFIRMED",
    fullName: "Karim El Amrani", phone: "+212 6 12 34 56 78", location: "Marrakech",
    budget: "2M – 3M MAD", address: "Route de l'Ourika", note: "Looking for a family villa.",
    assignedAgent: "Youssef Bennis", agentRole: "Portfolio Advisor", agentOnSite: false, transitMinutes: 15,
    propertyImage: "https://picsum.photos/seed/villaatlas/400/300",
    propertyPrice: "2,600,000 MAD", propertyRef: "P-ATL-004",
    accessCode: "Key stored with Concierge M. Youssef (Digital Safe Box 7, code: #2210)",
    conciergeName: "M. Youssef",
    checklist: [
      { label: "Digital NDA signed via WhatsApp AI", completed: true },
      { label: "Vector Architectural Dossier transmitted", completed: true },
      { label: "Physical key retrieval from concierge", completed: false }
    ]
  },
  {
    id: "v2", day: 2, start: 11, duration: 1.5,
    title: "L'Atelier...", client: "Mehdi T...", status: "PENDING",
    fullName: "Mehdi Tazi", phone: "+212 6 22 33 44 55", location: "Casablanca",
    budget: "1.2M – 1.8M MAD", address: "Boulevard Zerktouni, Casablanca", note: "Interested in a modern loft.",
    assignedAgent: "Leila Mansour", agentRole: "Senior Portfolio Advisor", agentOnSite: false, transitMinutes: 20,
    propertyImage: "https://picsum.photos/seed/atelier/400/300",
    propertyPrice: "1,450,000 MAD", propertyRef: "P-CAS-011",
    accessCode: "Key stored with Concierge Mme. Fatima (Digital Safe Box 3, code: #5581)",
    conciergeName: "Mme. Fatima",
    checklist: [
      { label: "Digital NDA signed via WhatsApp AI", completed: true },
      { label: "Vector Architectural Dossier transmitted", completed: false },
      { label: "Physical key retrieval from concierge", completed: false }
    ]
  },
  {
    id: "v3", day: 4, start: 9.5, duration: 1.5,
    title: "Villa Cher...", client: "Kenza B...", status: "VIP PREVIEW",
    fullName: "Kenza Bennani", phone: "+212 6 33 44 55 66", location: "Rabat",
    budget: "5M – 7M MAD", address: "Souissi, Rabat", note: "VIP client, looking for a luxury estate.",
    assignedAgent: "Sara Chen", agentRole: "Agency Director", agentOnSite: true, transitMinutes: 0,
    propertyImage: "https://picsum.photos/seed/villacherif/400/300",
    propertyPrice: "6,200,000 MAD", propertyRef: "P-RAB-002",
    accessCode: "Key stored with Concierge M. Hassan (Digital Safe Box 1, code: #9012)",
    conciergeName: "M. Hassan",
    checklist: [
      { label: "Digital NDA signed via WhatsApp AI", completed: true },
      { label: "Vector Architectural Dossier transmitted", completed: true },
      { label: "Physical key retrieval from concierge", completed: true }
    ]
  },
  {
    id: "v4", day: 1, start: 14, duration: 1.5,
    title: "Guéliz...", client: "David...", status: "ACTIVE",
    fullName: "David Miller", phone: "+44 7700 900341", location: "London, UK",
    budget: "4.5M – 5.5M MAD", address: "14 Rue de la Liberté, Guéliz, Marrakech",
    note: "Seeking high-yield 3-bedroom penthouse with panoramic Atlas terrace.",
    assignedAgent: "Leila Mansour", agentRole: "Senior Portfolio Advisor", agentOnSite: true, transitMinutes: 25,
    propertyImage: "https://picsum.photos/seed/guelizsky/400/300",
    propertyPrice: "4,200,000 MAD", propertyRef: "P-GEL-019",
    accessCode: "Key stored with Concierge M. Rachid (Digital Safe Box 12, code: #4912)",
    conciergeName: "M. Rachid",
    checklist: [
      { label: "Digital NDA signed via WhatsApp AI", completed: true },
      { label: "Vector Architectural Dossier transmitted", completed: true },
      { label: "Physical key retrieval from concierge", completed: false }
    ]
  },
  {
    id: "v5", day: 3, start: 16, duration: 1.5,
    title: "Riad Dar...", client: "Marc D...", status: "CONFIRMED",
    fullName: "Marc Dupont", phone: "+33 6 12 34 56 78", location: "Paris, France",
    budget: "3M – 4M MAD", address: "Riad Zitoun, Medina, Marrakech", note: "Looking for a traditional riad to renovate.",
    assignedAgent: "Youssef Bennis", agentRole: "Portfolio Advisor", agentOnSite: false, transitMinutes: 30,
    propertyImage: "https://picsum.photos/seed/riaddar/400/300",
    propertyPrice: "3,400,000 MAD", propertyRef: "P-MED-007",
    accessCode: "Key stored with Concierge M. Aziz (Digital Safe Box 5, code: #3347)",
    conciergeName: "M. Aziz",
    checklist: [
      { label: "Digital NDA signed via WhatsApp AI", completed: false },
      { label: "Vector Architectural Dossier transmitted", completed: false },
      { label: "Physical key retrieval from concierge", completed: false }
    ]
  }
]

// Later: GET /api/agents
export const agentsList: string[] = [
  "Sara Chen",
  "Karim El Amrani",
  "Youssef Bennis",
  "Leila Mansour"
]

// Later: GET /api/portfolios
export const portfoliosList: string[] = [
  "Palmeraie Collection",
  "Guéliz Portfolio",
  "Atlas Views"
]

// Later: GET /api/visit-statuses (or a fixed enum shared with the backend)
export const statusesList: string[] = [
  "Confirmed",
  "Pending",
  "Cancelled"
]

// Later: GET /api/agency/locations (regions this agency operates in)
export const activeLocations: string = "Marrakech & Casa"

// Later: GET /api/ai-engine/status
export const aiEngineActive: boolean = true
export const aiEngineStatusLabel: string = "AI ENGINE: ACTIVE & DISPATCHING"

// Later: GET /api/agency/settings (agency-level configuration)
export const agencyTimezone: string = "Africa/Casablanca (GMT+1)"