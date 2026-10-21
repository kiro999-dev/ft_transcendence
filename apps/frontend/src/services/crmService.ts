const API_BASE = 'http://localhost:3000';

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Visit Scheduled' | 'Closed';

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
  source: string;
  score: string;
  created_at: string;
  property_matches?: PropertyMatch[];
  notes?: string;
};

export async function fetchLeads(token: string, orgId: string): Promise<Lead[]> {
  const res = await fetch(`${API_BASE}/leads`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': orgId,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch leads: ${res.statusText}`);
  }
  return res.json();
}

export async function findLeadByPhone(phone: string, token: string, orgId: string): Promise<Lead | null> {
  const res = await fetch(`${API_BASE}/internal/ai/leads/phone?phone=${encodeURIComponent(phone)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': orgId,
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Failed to find lead by phone: ${res.statusText}`);
  }
  return res.json();
}

export async function createLead(leadData: Partial<Lead>, token: string, orgId: string): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': orgId,
    },
    body: JSON.stringify(leadData),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Failed to create lead: ${res.statusText}`);
  }
  return res.json();
}

export async function updateLead(id: string, updateData: Partial<Lead>, token: string, orgId: string): Promise<Lead> {
  const res = await fetch(`${API_BASE}/leads/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': orgId,
    },
    body: JSON.stringify(updateData),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Failed to update lead: ${res.statusText}`);
  }
  return res.json();
}

export async function savePropertyMatches(leadId: string, matches: PropertyMatch[], token: string, orgId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/internal/ai/leads/${leadId}/matches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Organization-Id': orgId,
    },
    body: JSON.stringify({ matches }),
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `Failed to save property matches: ${res.statusText}`);
  }
}
