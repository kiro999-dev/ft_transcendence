import type { LeadStatus } from "../../../services/crmService";

export const STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Interested",
  "Visit Scheduled",
  "Closed",
  "Lost",
];

export const statusColors: Record<string, string> = {
  New: "bg-blue-50 text-blue-600",
  Contacted: "bg-sky-50 text-sky-600",
  Interested: "bg-indigo-50 text-indigo-600",
  "Visit Scheduled": "bg-amber-50 text-amber-600",
  Closed: "bg-green-50 text-green-600",
  Lost: "bg-slate-100 text-slate-500",
};

export function initials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatBudget(budget: string) {
  if (!budget) return "—";
  return Number(budget).toLocaleString("en-US");
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
