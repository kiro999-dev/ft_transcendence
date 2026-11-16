import { apiFetch } from "../../lib/api";

export type AvailabilityRule = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export type WeeklyAvailability = {
  userId: string;
  slotDuration: number;
  isDefault: boolean;
  rules: AvailabilityRule[];
};

export type CalendarException = {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
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

export async function fetchWeeklyAvailability(userId: string): Promise<WeeklyAvailability> {
  const response = await apiFetch(`/api/availability/rules?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) {
    throw new Error(`Weekly rules: ${await parseError(response, "Unable to load availability")}`);
  }
  return response.json();
}

export async function saveWeeklyAvailability(data: {
  userId: string;
  slotDuration: number;
  rules: AvailabilityRule[];
}) {
  const response = await apiFetch("/api/availability/rules", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await parseError(response, "Unable to save availability"));
}

export async function fetchExceptions(userId: string): Promise<CalendarException[]> {
  const response = await apiFetch(`/api/availability/exceptions?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) {
    throw new Error(`Unavailable dates: ${await parseError(response, "Unable to load unavailable dates")}`);
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function createException(data: {
  userId: string;
  date: string;
  isUnavailable: true;
  startTime?: string;
  endTime?: string;
  reason?: string;
}) {
  const response = await apiFetch("/api/availability/exceptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(await parseError(response, "Unable to add unavailable date"));
  return response.json() as Promise<CalendarException>;
}

export async function deleteException(id: string) {
  const response = await apiFetch(`/api/availability/exceptions/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error(await parseError(response, "Unable to remove unavailable date"));
}
