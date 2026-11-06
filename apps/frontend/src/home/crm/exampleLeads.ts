import type { Lead } from "../../services/crmService";

export const exampleLeads: Partial<Lead>[] = [
  { name: "lme3za messi", phone: "+212600111001", email: "messi@mail.com", city: "Marrakech", budget: "250000", bedrooms: 2, status: "New", notes: "Wants a flat near Gueliz" },
  { name: "harry kane", phone: "+212600111002", email: "hkane@mail.com", city: "Casablanca", budget: "1200000", bedrooms: 4, status: "Contacted", notes: "Family villa, needs a garden" },
  { name: "drake baddi", phone: "+212600111003", city: "Agadir", budget: "300000", bedrooms: 3, status: "Interested", notes: "Close to the beach" },
  { name: "mohammed sadis", phone: "+212600111004", email: "mohame6@mail.com", city: "Rabat", budget: "650000", bedrooms: 3, status: "Visit Scheduled", notes: "Visit on Saturday 10:00" },
  { name: "ilyas allali", phone: "+212600111005", city: "Tangier", budget: "480000", bedrooms: 2, status: "Closed", notes: "Bought the Malabata flat" },
  { name: "zkhourba ", phone: "+212600111006", email: "zkhourbaofficial@mail.com", city: "Fes", budget: "180000", bedrooms: 1, status: "Lost", notes: "Budget too low for the area" },
  { name: "badr baddi", phone: "+212600111007", email: "badrbadi@mail.com", city: "Marrakech", budget: "900000", bedrooms: 5, status: "Interested", notes: "Riad in the medina" },
  { name: "moahmmed badd", phone: "+212600111008", city: "Casablanca", budget: "350000", bedrooms: 2, status: "New", notes: "First home, needs a loan" },
];