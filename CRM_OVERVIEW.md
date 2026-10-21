# CRM Overview

*Analysis of the existing Auto Estate / Northstar Realty CRM frontend code.*

---

## 1. What the CRM Currently Does

Based on the existing codebase in `apps/frontend/src/home/crm/crm.tsx` and related router/auth files, the CRM currently functions as a **fully visual, self-contained mock dashboard frontend** for real estate lead management. 

It provides a polished, interactive user interface featuring a searchable and filterable table of leads, detailed lead inspection via a sliding right-hand drawer, static metric cards, pipeline stage breakdowns, and simulated interactive actions (such as adding a lead, triggering outreach, or exporting reports) that display toast notifications.

---

## 2. What Is Working

| Feature / Component | Status | How It Works |
| :--- | :--- | :--- |
| **Lead Listing & Table** | Implemented & Working (Mock Data) | Renders a table of 6 pre-defined real estate leads with avatars, emails, phone numbers, property interests, budgets, and status badges. |
| **Search & Filtering** | Implemented & Working | `useMemo` hook filters the `leads` array dynamically as the user types a search query (matching name, email, or property) or clicks status filter pills ("New", "Contacted", "Interested", "Visit Scheduled", "Closed"). |
| **Lead Details Drawer** | Implemented & Working | Clicking any lead row opens a slide-in right-hand drawer (`LeadDetails`) displaying contact info, property preference, budget, activity timeline, and quick-action buttons. |
| **Add Lead Modal** | Partially Implemented (UI Only) | Clicking "Add Lead" opens a modal form with input fields. Submitting closes the modal and shows a success toast, but **does not persist** the lead to state or backend. |
| **Navigation & Routing** | Implemented & Working | Integrated via React Router (`/dashboard/crm` and redirect from `/crm`) protected by the app's `AuthProvider` and `Dashboard` sidebar shell. |
| **Standalone Demo Mode** | Implemented & Working | Includes a dedicated `index.html` and `styles.css` allowing the CRM page to be previewed independently of the main app shell. |

---

## 3. What Is Missing

- **Backend Persistence & API Integration:** There are no API calls or database connections for CRM leads; all data is hardcoded in memory.
- **Dynamic State Persistence:** Changes (such as adding a new lead or updating lead status) are ephemeral and reset on page refresh.
- **Real Communications:** Buttons for calling (`Tel:`), emailing (`mailto:`), chat, or "Automate outreach" only trigger local toast notifications (`showNotice`) rather than real-world integrations or communications.
- **Dynamic Metrics & Analytics:** The summary metric cards (Total leads, New this month, Active pipeline, Closed revenue) and pipeline stage progress bars display static, hardcoded numbers rather than computed metrics from the lead list.
- **Pagination:** Pagination buttons ("Previous", "Next", page numbers 1/2/3) are static UI elements with no functional state attached.
- **AI Broker Insights:** The AI recommendation section inside the lead drawer displays static placeholder text.

---

## 4. How the Code Works

The CRM is architected as a monolithic, self-contained React component:

1. **`apps/frontend/src/home/crm/crm.tsx` (Main Component):**
   - **Types:** Defines inline TypeScript types (`Status`, `Lead`).
   - **Mock Data:** Declares a static `leads` array containing 6 sample client records.
   - **State (`useState`):** Manages local UI state: `search` (string), `filter` (Status | "All"), `selectedLead` (Lead | null for drawer), `showAdd` (boolean for modal), and `notice` (string for toast messages).
   - **Filtering (`useMemo`):** Computes the filtered subset of leads based on search text and active status filter.
   - **Sub-components:** Implements modular sub-components directly within the file:
     - `IconButton` & `StatusPill`: Reusable UI elements.
     - `MetricCard`: Renders summary statistics.
     - `LeadTable`: Renders the main data table and handles row selection.
     - `LeadDetails`: Renders the slide-in drawer with contact history, timeline, and actions.

2. **Styling & Assets:**
   - **`styles.css`:** Contains custom CSS animations (`slide-in`, `toast-in`), component styles (`.panel`, `.drawer`, `.stat-card`), and imports Tailwind and Google Fonts (Manrope).
   - **Integration:** Rendered inside `Dashboard.tsx` via `App.tsx` routing (`/dashboard/crm`), inheriting the global `AuthProvider` state and sidebar navigation.

---

## 5. CRM Workflow

Based on the existing frontend implementation, the lead management workflow operates as follows:

1. **Viewing Leads:** Users navigate to `/dashboard/crm` where they see summary metric cards, pipeline stage bars, and the main lead table populated with mock data.
2. **Searching:** Typing in the search input instantly filters the table rows by matching client names, email addresses, or property names.
3. **Filtering by Status:** Clicking filter pills ("All", "New", "Contacted", "Interested", "Visit Scheduled", "Closed") restricts the table to leads matching that specific status.
4. **Inspecting Lead Details:** Clicking a row selects that lead and slides open the right-side drawer, revealing contact info, budget, property interest, and recent activity timeline.
5. **Creating Leads:** Clicking "Add Lead" opens a popup modal. Entering name, email, and property and clicking "Save" displays a success toast notification. *(Note: The lead is not appended to the table list).*
6. **Updating / Interacting:** Clicking action buttons (Call, Email, Chat, Automate outreach) triggers toast alerts simulating the respective actions.

---

## 6. What You Need to Understand Before Building the Backend

Before implementing the backend API and database for the CRM, you should understand:

1. **Entity Relationships & Data Models:**
   - **Lead / Contact:** Attributes needed (id, name, email, phone, property interest, budget, status, source, score, created timestamp, assigned agent/organization).
   - **Pipeline Stages:** How leads transition through statuses (`New` → `Contacted` → `Interested` → `Visit Scheduled` → `Closed`).
   - **Activity / Timeline:** How interaction history (calls, emails, notes) is logged against a lead.
2. **State Management & API Architecture:**
   - How the frontend will transition from local `useState` arrays to asynchronous API calls (`fetch` / `axios` with `async/await` and loading/error states).
   - Authentication propagation: Ensuring CRM endpoints are protected by Bearer tokens (`accessToken` from `AuthContext`) and scoped by `organization_id`.
3. **Validation & Security:**
   - Phone number validation (`libphonenumber-js`), email formatting, and input sanitization on both frontend and backend.
   - Role-based access control (ensuring users can only access leads belonging to their organization).

---

## 7. What to Remove or Simplify

To keep the CRM architecture clean and maintainable as you transition to a backend-connected app, consider simplifying or refactoring:

- **Move Inline Types & Mock Data:** Extract `Lead` and `Status` types into a shared types file (`src/types/crm.ts`) and mock data into a separate service or seed file rather than keeping them embedded in `crm.tsx`.
- **Break Down Monolithic Components:** `crm.tsx` contains multiple large sub-components in a single file. Split `LeadTable`, `LeadDetails`, and modal components into separate files under `src/home/crm/components/`.
- **Dynamic Metrics Calculation:** Replace hardcoded metric card values and pipeline percentages with dynamic calculations derived from the fetched lead array.
- **Remove Dead UI Controls:** Either wire up pagination and export buttons to real functionality or temporarily hide them until pagination and reporting endpoints are built.

---

## 8. What Comes Next (Prioritized Action Plan)

### Phase 1: Clean Up & Prepare Frontend (Pre-Backend)
1. **Refactor Code Structure:** Extract inline types from `crm.tsx` into a dedicated types file and split sub-components into modular files.
2. **State Hook Preparation:** Create a custom hook or service wrapper (e.g., `useCrmApi`) that abstracts API calls so switching from mock data to backend endpoints requires minimal component changes.

### Phase 2: Design Backend API & Database Schema
1. **Database Models:** Define SQL/ORM models for `Leads`, `LeadActivities`, and `PipelineStages` linked to `Organizations` and `Users`.
2. **API Endpoints:**
   - `GET /crm/leads` (list with search, filter, and pagination support)
   - `POST /crm/leads` (create lead)
   - `GET /crm/leads/:id` (get lead details & timeline)
   - `PATCH /crm/leads/:id` (update lead status/details)
   - `DELETE /crm/leads/:id` (delete lead)

### Phase 3: Connect Frontend to Backend
1. **Replace Mock Data with API Calls:** Wire `useEffect` hooks in the CRM component to fetch leads from the backend API upon load.
2. **Implement Mutations:** Connect "Add Lead", status updates, and note-taking features to backend POST/PATCH endpoints with loading states and error handling via `react-hot-toast`.
3. **Verify & Test:** Test full end-to-end lead lifecycle (create, search, filter, update, view timeline) against the running backend.
