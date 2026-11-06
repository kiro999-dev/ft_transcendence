import { apiFetch } from "@/lib/api";
const API_BASE = "http://localhost:3000";

export type LeadStatus = "New" | "Contacted" | "Interested" | "Visit Scheduled" | "Closed" | "Lost";

export type PropertyMatch = {
  id: string;
  title: string;
  location: string;
  price: string;
  matchScore: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  budget: string;
  bedrooms: number | string;
  status: LeadStatus;
  score: string;
  created_at: string;
  property_matches?: PropertyMatch[];
  notes?: string;
};


export async function fetchLeads(token: string): Promise<Lead[]> {
  const res = await apiFetch(`${API_BASE}/leads`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load leads");
  return res.json();
}


export async function createLead(data: Partial<Lead>, token: string): Promise<Lead> {
  const res = await apiFetch(`${API_BASE}/leads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create lead");
  return res.json();
}

export async function updateLead(id: string, data: Partial<Lead>, token: string): Promise<Lead> {
  const res = await apiFetch(`${API_BASE}/leads/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}
