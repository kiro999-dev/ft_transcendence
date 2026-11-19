import type { Lead } from "../../services/crmService";

export const exampleLeads: Partial<Lead>[] = [
  { id: "4d2ed9db-b3f2-4d8f-9ef7-8a3d4dd44f01", isExample: true, name: "lme3za messi", phone: "+212600111001", email: "messi@mail.com", city: "Marrakech", budget: "250000", bedrooms: 2, status: "New", notes: "Wants a flat near Gueliz" },
  { id: "6a8ffbd1-73d3-4e5d-9be1-6f5f7e0f1c22", isExample: true, name: "harry kane", phone: "+212600111002", email: "hkane@mail.com", city: "Casablanca", budget: "1200000", bedrooms: 4, status: "Contacted", notes: "Family villa, needs a garden" },
  { id: "9df1b238-95f6-4c7d-ab35-6aa4ea5d31b9", isExample: true, name: "drake baddi", phone: "+212600111003", city: "Agadir", budget: "300000", bedrooms: 3, status: "Interested", notes: "Close to the beach" },
  { id: "20b4d87f-89f8-41d6-8dba-d4b7c4f2a906", isExample: true, name: "mohammed sadis", phone: "+212600111004", email: "mohame6@mail.com", city: "Rabat", budget: "650000", bedrooms: 3, status: "Visit Scheduled", notes: "Visit on Saturday 10:00" },
  { id: "c7c41427-2ef0-45a4-ba1d-3d45d3022162", isExample: true, name: "ilyas allali", phone: "+212600111005", city: "Tangier", budget: "480000", bedrooms: 2, status: "Closed", notes: "Bought the Malabata flat" },
  { id: "f2df9a54-09e2-4949-a741-2e6d6a3ef079", isExample: true, name: "zkhourba ", phone: "+212600111006", email: "zkhourbaofficial@mail.com", city: "Fes", budget: "180000", bedrooms: 1, status: "Lost", notes: "Budget too low for the area" },
  { id: "82de7dd5-f3fe-44b4-b88d-91b3fd6934aa", isExample: true, name: "badr baddi", phone: "+212600111007", email: "badrbadi@mail.com", city: "Marrakech", budget: "900000", bedrooms: 5, status: "Interested", notes: "Riad in the medina" },
  { id: "0d20411b-2151-4fe1-a3f0-f8d4cc8a3cf5", isExample: true, name: "moahmmed badd", phone: "+212600111008", city: "Casablanca", budget: "350000", bedrooms: 2, status: "New", notes: "First home, needs a loan" },
];