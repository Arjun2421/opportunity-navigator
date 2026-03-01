

# Tender Updates Tracker - New Dashboard Page

## Overview

Add a new **"Tender Updates"** page to the existing dashboard that tracks subcontractor and client timeline events per tender. The page links to existing tenders from `DataContext`, uses `localStorage` for update persistence (matching existing patterns), and includes list/timeline views, an interactive tree/graph, and export to Excel (.xlsx) and Word (.docx).

---

## Data Model

### New interfaces (in a new service file)

```text
TenderUpdate {
  id: string (uuid)
  opportunityId: string (maps to TenderData.id)
  type: "subcontractor" | "client"
  subType: "contacted" | "response" | "note" | "submission" | "extension" | "clarification"
  actor: string
  date: string (ISO8601)
  dueDate: string | null
  details: string
  attachments: string[]
  createdBy: string
  createdAt: string (ISO8601)
}
```

Updates are stored in `localStorage` under key `tenderUpdates` and managed via `getTenderUpdates()`, `addTenderUpdate()`, `deleteTenderUpdate()` helper functions -- same pattern as `vendorData.ts`.

Tenders are referenced from the existing `DataContext` (tender name + ref number + group are already available).

---

## Page Layout & Components

### 1. Top Filter Bar
- **Group filter** (multi-select from existing `groupClassification` values)
- **Search** by tender name / ref number
- **Status filter** (from existing `avenirStatus`)
- **Owner/Lead filter**
- **Toggle: "Show Only Upcoming Due Dates"**

### 2. Split-Pane Layout (using existing `react-resizable-panels`)

**Left Pane: Opportunity Table**
- Columns: Group, Tender Name, Ref No, Lead, Next Due Date (calculated pill -- red/orange/green), Status
- Row click selects the tender and loads its timeline in the right pane
- Multi-select checkboxes for bulk export

**Right Pane: Dual Timeline**
- Two parallel lanes per selected tender:
  - **Lane A -- Subcontractor Updates**: contacted, response, note events in chronological order
  - **Lane B -- Client Events**: submission due dates, extensions, clarifications
- Each event is a card showing date, sub_type badge, actor, short details (expandable)
- "Add Update" button opens a modal form (type, sub_type, actor, date, due_date, details)

### 3. Upcoming Due Dates Widget
- Mini calendar-style list showing due dates across filtered tenders (next 30/60/90 days toggle)
- Clicking an item selects that tender row

### 4. Full-Screen Interactive Graph View
- Button: "Open Fullscreen Tree"
- Hierarchical tree: Group -> Opportunities -> Update events
- Built with pure SVG/CSS (no heavy external lib needed for the scale of data here)
- Pan/zoom via CSS transforms + mouse/wheel handlers
- Node types with distinct colors: blue for subcontractor, green for client, orange border for pending due dates, red for overdue
- Click node to open detail; double-click to zoom into that cluster
- Search highlight + fit-to-screen button
- Also offer a Mermaid text preview toggle (auto-generated flowchart string)

### 5. Export
- **Excel (.xlsx)**: Sheet 1 = Opportunities list, then one sheet per selected opportunity with its updates. Uses existing `xlsx` library.
- **Word (.docx)**: Install `docx` package. Generates a document with cover page, per-opportunity sections including update tables. Mermaid SVG snapshot embedded as an image if feasible, otherwise a text representation.

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/data/tenderUpdatesData.ts` | TenderUpdate interface, localStorage CRUD, seed data, due date calculations |
| `src/pages/TenderUpdates.tsx` | Main page with filter bar, split pane, timeline, graph toggle |
| `src/components/TenderUpdates/UpdateTimeline.tsx` | Dual-lane timeline component |
| `src/components/TenderUpdates/AddUpdateModal.tsx` | Form dialog to add/edit updates |
| `src/components/TenderUpdates/InteractiveGraph.tsx` | Full-screen zoomable tree/graph |
| `src/components/TenderUpdates/DueDatesWidget.tsx` | Upcoming due dates mini-widget |
| `src/components/TenderUpdates/MermaidPreview.tsx` | Auto-generated Mermaid text preview |

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Add `/tender-updates` route |
| `src/components/AppSidebar.tsx` | Add "Tender Updates" nav item with a `GitBranch` icon |
| `package.json` | Add `docx` dependency for Word export |

---

## Seed Data

Pre-populate 3-4 sample updates linked to existing tenders so the page is not empty on first load. These will reference actual tender IDs from the Google Sheets data once loaded, with fallback sample IDs.

---

## Technical Notes

- **No backend needed**: All updates stored in `localStorage`, consistent with existing vendor/approval patterns.
- **Existing dependencies reused**: `xlsx` for Excel, `react-resizable-panels` for split pane, `recharts` colors for consistency, `lucide-react` icons.
- **New dependency**: `docx` (npm package) for Word document generation.
- **Role-based access**: Only master/admin/proposal_head can add updates; basic users get read-only view (uses existing `useAuth()`).
- **Interactive graph**: Built with vanilla React + SVG rather than Cytoscape/D3 to avoid heavy dependencies. Uses CSS `transform` for pan/zoom.

---

## Sequencing

1. Create data layer (`tenderUpdatesData.ts`) with interfaces, CRUD, seed data, and due-date calculations
2. Build the timeline and modal components
3. Build the main page with filters, split pane, and timeline integration
4. Build the interactive graph and Mermaid preview
5. Add export (xlsx + docx)
6. Wire up routing and sidebar navigation

---

## Codex Prompt (for replicating this in another project)

Below is a self-contained prompt you can give to Codex or another AI to replicate this feature:

```text
Create a "Tender Updates Tracker" page in an existing React + TypeScript + Tailwind + Vite dashboard app. The app already has a TenderData model with fields: id, refNo, tenderName, client, avenirStatus, groupClassification, lead, value. Tenders are fetched via a DataContext (useData() hook).

Requirements:
1. DATA MODEL: Create a TenderUpdate interface with fields: id (uuid), opportunityId (links to TenderData.id), type ("subcontractor" | "client"), subType ("contacted" | "response" | "note" | "submission" | "extension" | "clarification"), actor (string), date (ISO8601), dueDate (ISO8601 | null), details (string), attachments (string[]), createdBy (string), createdAt (ISO8601). Store in localStorage with CRUD helpers.

2. PAGE LAYOUT: Split-pane layout (react-resizable-panels). Left pane = filterable tender table (group, search, status, lead filters + "upcoming due dates only" toggle). Right pane = dual-lane timeline for the selected tender (Lane A: Subcontractor updates, Lane B: Client events). Each event is an expandable card.

3. ADD/EDIT MODAL: Dialog form to create updates with type, subType, actor, date, dueDate, details fields.

4. UPCOMING DUE DATES WIDGET: Shows due dates across filtered tenders for next 30/60/90 days. Clicking selects the tender.

5. FULL-SCREEN INTERACTIVE GRAPH: Hierarchical tree (Group -> Tender -> Updates) with pan/zoom (CSS transforms), color-coded nodes (blue=subcontractor, green=client, orange=pending, red=overdue), click-to-detail, double-click-to-zoom, search highlight, fit-to-screen. Also offer a Mermaid text preview toggle.

6. EXPORT: Excel (.xlsx via SheetJS) with Opportunities sheet + per-tender update sheets. Word (.docx via docx npm package) with cover page, per-tender sections, and update tables.

7. NAVIGATION: Add route /tender-updates and sidebar link with GitBranch icon.

8. ACCESS CONTROL: Only admin/master roles can add updates; basic users are read-only.

9. SEED DATA: Pre-populate 3-4 sample updates so the page works out of the box.

Use existing UI components (shadcn/ui), Tailwind classes, and project patterns (localStorage persistence, useCurrency for values, useAuth for roles).
```

