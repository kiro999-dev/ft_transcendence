import { apiFetch } from "../../lib/api";

export type Visit = {
  id: string;
  userId: string;
  property_id: string;
  leadId: string;
  date_of_visit: string;
  status: string;
  startAt: string;
  endAt: string;
};

export type Property = {
  id: string;
  title: string;
  city?: string;
  address?: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
};

export type AvailabilitySlot = {
  starts_at: string;
  ends_at: string;
  agent_id: string;
  agent_name: string;
};

async function parseError(response: Response, fallback: string) {
  try {
    const payload = await response.json();
    if (typeof payload?.message === "string") return payload.message;
  } catch {
    // Keep the fallback when the server does not return JSON.
  }
  return fallback;
}

export async function fetchVisits(): Promise<Visit[]> {
  const response = await apiFetch("/internal/ai/visits");
  if (!response.ok) throw new Error(await parseError(response, "Unable to load bookings"));
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchProperties(): Promise<Property[]> {
  const response = await apiFetch("/properties");
  if (!response.ok) throw new Error(await parseError(response, "Unable to load properties"));
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchLeads(): Promise<Lead[]> {
  const response = await apiFetch("/leads");
  if (!response.ok) throw new Error(await parseError(response, "Unable to load clients"));
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchAvailability(
  propertyId: string,
  date: string,
  durationMinutes: number,
): Promise<AvailabilitySlot[]> {
  const response = await apiFetch("/internal/ai/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      property_id: propertyId,
      preferred_date: date,
      timezone: "Africa/Casablanca",
      duration_minutes: durationMinutes,
    }),
  });
  if (!response.ok) throw new Error(await parseError(response, "Unable to load available slots"));
  const data = await response.json();
  return Array.isArray(data?.slots) ? data.slots : [];
}

export async function cancelVisit(id: string) {
  const response = await apiFetch(`/internal/ai/visits/${id}/cancel`, { method: "PATCH" });
  if (!response.ok) throw new Error(await parseError(response, "Unable to cancel this booking"));
}

export async function rescheduleVisit(id: string, startsAt: string) {
  const response = await apiFetch(`/internal/ai/visits/${id}/reschedule`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ starts_at: startsAt }),
  });
  if (!response.ok) throw new Error(await parseError(response, "Unable to reschedule this booking"));
  return response.json() as Promise<Visit>;
}

export async function createVisit(
  data: {
    lead_id: string;
    contact_id?: string;
    property_id: string;
    agent_id: string;
    starts_at: string;
    duration_minutes: number;
    customer_notes?: string;
  },
  organizationId?: string,
) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (organizationId) {
    headers["x-organization-id"] = organizationId;
  }
  const response = await apiFetch("/internal/ai/visits", {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await parseError(response, "Unable to create this booking"));
  return response.json();
}
