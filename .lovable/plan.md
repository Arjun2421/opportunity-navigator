
# Complete Recreation Prompt for Tender Management Dashboard

Copy and paste the following prompt into a new Lovable project to recreate this application from scratch:

---

## MASTER PROMPT: Tender Management Dashboard

Build a complete **Tender Management Dashboard** web application using React, TypeScript, Tailwind CSS, and Vite. This is a multi-page enterprise dashboard for tracking tender/bid opportunities, with Google Sheets as the data source, a role-based authentication system, and a two-step approval workflow. Below is every feature, page, component, and behavior described in full detail.

---

### 1. TECHNOLOGY AND DEPENDENCIES

Install these exact packages:
- `@tanstack/react-query` for data fetching
- `react-router-dom` for routing
- `recharts` for analytics charts (PieChart, BarChart, AreaChart, LineChart)
- `xlsx` for Excel export functionality
- `date-fns` for date utilities
- `sonner` for toast notifications
- `lucide-react` for icons
- `embla-carousel-react` for carousels
- Use all standard shadcn/ui components (accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toast, toggle, toggle-group, tooltip)

---

### 2. THEMING AND STYLING

Use a custom color system with CSS variables in `index.css`:

**Light theme:** Background `220 20% 97%`, foreground `222 47% 11%`, primary `217 91% 60%` (blue), card white, accent `142 76% 36%` (green), destructive `0 84% 60%` (red).

**Dark theme:** Background `222 47% 8%`, foreground `210 40% 98%`, card `222 47% 11%`, secondary `217 33% 17%`, muted-foreground `215 20% 65%`.

**Custom dashboard color variables:**
- `--success: 142 76% 36%` (green)
- `--warning: 38 92% 50%` (amber)
- `--info: 199 89% 48%` (cyan)
- `--pending: 262 83% 58%` (purple)
- Pipeline status colors: prebid (info), inprogress (warning), submitted (pending/purple), awarded (success), lost (destructive), hold (muted)
- Gradient variables for primary, success, warning, danger, and hero gradients

**Font:** Import Inter (weights 300-800) and JetBrains Mono (400-500) from Google Fonts. Body uses Inter.

**Custom CSS classes:** `glass-card` (backdrop blur card), `kpi-card` (hover animation with gradient overlay), `status-badge`, `imputed-indicator`, `data-table-row`, `funnel-stage`, `sidebar-nav-item`, `scrollbar-thin` (thin custom scrollbar), `text-gradient`, `animate-fade-in`, `animate-slide-up`, `animate-pulse-slow`.

**Theme toggle:** A button component using `Moon`/`Sun` icons that toggles `.dark` class on `document.documentElement` and persists to localStorage.

---

### 3. AUTHENTICATION SYSTEM (`AuthContext`)

Create a context-based auth system with **five user roles**: `master`, `admin`, `proposal_head`, `svp`, `basic`.

**User interface:**
```
id, email, displayName, role (UserRole), assignedGroup? (string, for SVP users)
```

**Demo users (hardcoded for login):**
| Email | Password | Role | Group |
|---|---|---|---|
| master@example.com | master123 | master | - |
| proposalhead@example.com | ph123 | proposal_head | - |
| svp-ges@example.com | svp123 | svp | GES |
| svp-gds@example.com | svp123 | svp | GDS |
| admin@example.com | admin123 | admin | - |
| user@example.com | user123 | basic | - |

**AuthContext provides:**
- `user`, `isAuthenticated`, `isMaster`, `isAdmin`, `isProposalHead`, `isSVP`
- `login(email, password)` - matches against demo users, returns `{success, error?}`
- `logout()` - clears user from state and localStorage
- `getAllUsers()` - returns all demo users with any custom role overrides
- `updateUserRole(userId, newRole, assignedGroup?)` - Master can change roles; persisted to localStorage key `user_roles`

Role hierarchy: `isMaster` = role is master. `isAdmin` = role is admin OR master. `isProposalHead` = role is proposal_head OR master. `isSVP` = role is svp OR master.

Auth state persisted to localStorage key `auth_user`. Custom role overrides persisted to `user_roles`.

---

### 4. LOGIN PAGE (`/login`)

A centered card with lock icon, title "Welcome Back", subtitle "Sign in to access the Opportunity Dashboard". Email input with User icon prefix, password input with Lock icon prefix, "Sign In" button with LogIn icon. Shows error alert on failed login. Simulates 500ms network delay.

Below the form, show two info boxes:
1. **Demo Credentials** listing all 6 demo users
2. **Two-Step Approval Roles** explaining each role's purpose

---

### 5. PROTECTED ROUTE

Wrap all authenticated routes in a `ProtectedRoute` component that redirects to `/login` if not authenticated, preserving the intended destination in location state.

---

### 6. CENTRALIZED DATA COLLECTION SERVICE (`dataCollection.ts`)

**This is the single source of truth for ALL data.** Every component reads from this service. No other file fetches or processes raw data.

**Google Sheets Configuration:**
- API Key: `AIzaSyCrcexNBXPTaclKhCzkONVwCngRij837j0`
- Spreadsheet ID: `1DrnoJDytUd3_2uL5C3yyHT4yX4kleonTXaxiLgPCYK4`
- Sheet Name: `MASTER TENDER LIST AVENIR`
- Data starts from Row 4, Column B. Row 3 contains headers.

**TenderData interface:**
```
id, refNo, tenderType, client, tenderName, rfpReceivedDate (string|null),
lead, value (number), avenirStatus, tenderResult, tenderStatusRemark,
remarksReason, isSubmissionNear (boolean), year, rawDateReceived, groupClassification
```

**Column mapping (dynamic from headers):** Find columns by keyword matching:
- TENDER NO/REF NO -> refNo
- TENDER TYPE/TYPE -> tenderType
- CLIENT -> client
- TENDER NAME/DESCRIPTION -> tenderName
- YEAR -> year
- DATE TENDER RECD/DATE RECEIVED -> dateReceived
- LEAD/INTERNAL LEAD -> lead
- TENDER VALUE/VALUE -> value
- AVENIR STATUS -> avenirStatus
- TENDER RESULT -> tenderResult
- TENDER STATUS -> tenderStatusRemark
- REMARKS/REASON -> remarksReason
- GDS/GES/GROUP -> groupClassification

**Date parsing logic:** Combine `Year` column with `Date Tender Recd` column. Handle formats: "6-May", "15 Jul", "May 6", "DD/MM". Use month name mapping (jan-dec, full and abbreviated). If year is missing, use current year.

**Submission Near logic:** A tender is "submission near" if today is within 7 days after the received date.

**Status deduplication:** If AVENIR STATUS and TENDER RESULT have the same normalized (uppercase, trimmed) value, count only once (use avenir, clear tender result).

**KPI calculation function (`calculateKPIStats`):**
- Active Tenders = count where status is WORKING/ONGOING/SUBMITTED/AWARDED (deduplicated by tender ID)
- Total Active Value = sum of value for AWARDED tenders
- Awarded count/value from AVENIR STATUS
- Lost count/value
- Regretted count/value
- Working count/value (combined with ONGOING)
- To Start count/value
- Ongoing count/value (from TENDER RESULT if not already counted)
- Submission Near count

**Funnel data:** Stages: TO START -> WORKING -> SUBMITTED -> AWARDED. Calculate count, value, and conversion rate between stages.

**Client leaderboard:** Group by client, sum values, sort by value descending, return top 10.

**Submission near tenders:** Filter where isSubmissionNear is true, sort by date ascending, limit to 8.

**Legacy format converter:** `convertToOpportunityFormat()` maps TenderData fields to the legacy Opportunity interface for backward compatibility with Analytics/Clients/Tenders pages.

**Mock data fallback:** If Google Sheets fetch fails or returns 0 rows, generate 40 mock tenders with groups [GES, GDS, GTN, GTS], statuses [WORKING, SUBMITTED, AWARDED, TO START, HOLD/CLOSED, REGRETTED], clients [ADNOC, GALFAR, ENPPI, etc.], leads [Vishnu, Ashwin, Aseeb, Gayathri, Shalini, Khalid], types [EOI, Tender, RFQ, RFP].

---

### 7. DATA CONTEXT (`DataContext`)

Wraps the app. Provides: `tenders` (TenderData[]), `opportunities` (legacy format), `kpiStats`, `funnelData`, `clientData`, `submissionNearTenders`, `isLoading`, `error`, `refreshData()`, `clearAllData()`, `isDataCleared`.

On mount, calls `fetchGoogleSheetsData()` and computes all derived data. `clearAllData()` resets everything and removes localStorage keys `approvals` and `syncLogs`.

---

### 8. CURRENCY CONTEXT (`CurrencyContext`)

Toggle between USD and AED. Rate: 1 USD = 3.67 AED. Provides `currency`, `setCurrency`, `formatCurrency(value)`, `convertValue(value)`, `aedSymbolUrl`. Uses a custom AED symbol image (`src/assets/aed-symbol.png`). Persists choice to localStorage key `currency`.

---

### 9. APPROVAL CONTEXT (`ApprovalContext`)

**Two-step approval workflow:**
- Status progression: `pending` -> `proposal_head_approved` -> `fully_approved`
- Each tender tracked by ID in a Record

**ApprovalState per tender:**
```
proposalHeadApproved (boolean), proposalHeadBy?, proposalHeadAt?,
svpApproved (boolean), svpBy?, svpAt?
```

**Functions:**
- `approveAsProposalHead(opportunityId, performedBy)` - sets proposalHeadApproved=true, logs action
- `approveAsSVP(opportunityId, performedBy, group)` - only if proposalHeadApproved=true, sets svpApproved=true, logs action
- `revertApproval(opportunityId, performedBy, performedByRole)` - deletes approval entry entirely, logs action
- `getApprovalStatus(id)` - returns 'pending' | 'proposal_head_approved' | 'fully_approved'
- `refreshApprovals()` - reloads from localStorage

**Approval logs:** Array of `{id, opportunityId, action, performedBy, performedByRole, timestamp, group?}`. Actions: `proposal_head_approved`, `svp_approved`, `reverted`.

Persisted to localStorage keys `tender_approvals_v2` and `approval_logs`.

---

### 10. APP LAYOUT

**Sidebar (`AppSidebar`):** Collapsible sidebar using shadcn Sidebar component.
- Header: Logo icon (BarChart3 in primary-colored square) + "Tender Manager" / "Tender Tracking"
- Navigation group: Dashboard (/), All Tenders (/opportunities), Tenders (/tenders), Clients (/clients), Analytics (/analytics)
- By Status group (collapsible): Pre-bid, In Progress, Submitted, Awarded, Lost/Regretted, On Hold - each with colored icons
- Administration group: Admin Panel (/admin) with "Protected" badge
- Footer: "Last sync: [current datetime]"

**Header (in Layout):** Sticky header with sidebar trigger, "Opportunity Dashboard" title with BarChart3 icon, last updated date, ThemeToggle, and user dropdown menu showing displayName, email, Admin Panel link (if admin), and Logout.

---

### 11. DASHBOARD PAGE (`/`)

**Loading state:** Skeleton placeholders for header, 9 KPI cards, and main table.
**Error state:** Destructive alert with retry button.

**Layout order (top to bottom):**
1. Header with title "Dashboard", tender count, Refresh Data button (with spinning icon), Export Excel button
2. **KPI Cards** - 9 cards in a responsive grid (3 cols mobile, 5 cols md, 9 cols lg):
   - Active Tenders (Target icon, primary color)
   - Total Active Value (currency icon, info color)
   - Awarded (Trophy icon, success) - shows count + currency value
   - Lost (XCircle, destructive) - shows count + currency value
   - Regretted (ThumbsDown, muted) - shows count + currency value
   - Working (Activity, warning) - shows count + currency value
   - To Start (PlayCircle, info) - shows count + currency value
   - Ongoing (FileCheck, pending) - shows count + currency value
   - Submission Near (Clock, destructive) - shows count only
   - Each card has hover animation (-translate-y-1), staggered fade-in, icon in colored background circle
   - Currency values use CurrencyContext with AED symbol image support

3. **Tenders Table (OpportunitiesTable)** - The dominant section:
   - Card with search input, status filter dropdown (ALL, HOLD/CLOSED, REGRETTED, SUBMITTED, AWARDED, TO START, WORKING), refresh approvals button
   - Scrollable table (max-h 400px) with sticky header
   - Columns: Ref No. (mono font), Type (badge), Client (truncated), Group (mono badge), RFP Received (bold), Lead, Value (right-aligned mono with currency), AVENIR STATUS (colored badge), TENDER RESULT (colored badge), Approval (interactive), Remarks (popover with message icon)
   - Shows max 50 rows with count footer
   - Clicking a row opens detail sheet panel
   - **Approval cell logic:**
     - Pending: Show "PH Approve" button if user is Proposal Head, otherwise "Pending PH" badge
     - PH Approved: Show "PH checkmark" badge + arrow + "SVP Approve" button (if user is SVP for that group) or "Awaiting SVP" badge. Master can revert.
     - Fully Approved: Show green "Fully Approved" badge with checkmark. Master can revert (RotateCcw icon).
     - SVP can only approve tenders matching their assignedGroup
   - Remarks column: MessageSquare popover showing tenderStatusRemark and remarksReason. AlertTriangle warning icon if isSubmissionNear.

4. **Secondary widgets grid** (3 columns on lg):
   - **Pipeline Funnel:** Horizontal bar chart showing TO START -> WORKING -> SUBMITTED -> AWARDED stages with colored bars, counts, values, and conversion percentages
   - **Submission Near Widget:** List of up to 8 tenders with approaching deadlines, showing client, lead, days left badge (destructive if <=2 days), ref number
   - **Client Leaderboard:** Top 8 clients by value with progress bars, rank numbers, formatted currency values and tender counts

5. **Detail Sheet:** Slide-out panel (450px) showing selected tender's ref number, name, client, status badges, type, value, RFP received date, lead, and remarks sections.

---

### 12. OPPORTUNITIES PAGE (`/opportunities`)

Full-page tenders table with optional `statusFilter` prop for filtered views. Header with title (dynamic based on filter), count, and Export button. Same OpportunitiesTable component as Dashboard. Same detail sheet panel.

Status-based routes: `/status/pre-bid`, `/status/in-progress`, `/status/submitted`, `/status/awarded`, `/status/lost`, `/status/on-hold`.

---

### 13. TENDERS PAGE (`/tenders`)

Uses legacy opportunity format data. Shows:
- Title with FileSpreadsheet icon
- Status filter pills (All + each status with counts)
- Upcoming deadline alert card (warning theme) for tenders due within 14 days
- Search input
- Table with columns: Tender No., Name, Client, Status (colored badge), Received date, Due date (with AlertTriangle if will miss), Submitted date (with CheckCircle if submitted), Value

---

### 14. CLIENTS PAGE (`/clients`)

Uses legacy opportunity format. Shows:
- Summary cards: Total Clients, Total Opportunities, Total Pipeline Value, Avg per Client
- Search input
- Grid of client cards (1/2/3 cols responsive), each showing: rank number, client name, win rate badge, opportunity count, formatted value, progress bar (relative to max), status breakdown badges (Won/Submitted/In Progress/Lost with colored borders)

---

### 15. ANALYTICS PAGE (`/analytics`)

Uses legacy opportunity format with recharts. Shows:
- Summary row: Active Opps, Won, Lost, At Risk, Pipeline Value, Weighted Value
- Charts row 1: Stage Distribution (donut PieChart with legend), Group Performance (horizontal BarChart showing value by group)
- Charts row 2: Monthly Pipeline Trend (AreaChart), Lead Win/Loss Performance (stacked BarChart)
- Top Clients by Pipeline Value (horizontal BarChart, top 10)

---

### 16. ADMIN PAGE (`/admin`) - Master Control Panel

**Access:** Only Master users. Admins see "Access Denied" card. Other roles see same.

**Header:** Shield icon + "Master Control Panel", username/role display, USD/AED toggle switch, Logout button.

**Quick stats grid (6 cards):** Records count, Data Health %, Imputed count, Sync Status, SharePoint status, Uptime (99.9%).

**Tabs (11 total):**

1. **Sheets** - Google Sheets Sync panel: Shows "Connected to Google Sheets" status, Sync Now button, View Settings button. Settings dialog shows spreadsheet ID, sheet name, data start info, and column mapping interface with auto-suggest.

2. **Mapping** - Data Field Mappings panel: Lists all 14 fields (refNo, tenderType, client, tenderName, lead, value, year, rawDateReceived, rfpReceivedDate, avenirStatus, tenderResult, tenderStatusRemark, remarksReason, isSubmissionNear) with source column names, customizable display names (inline edit), visibility toggles (Switch), data preview from first record, drag handle icons, save/reset buttons. Stats showing total/visible/hidden/records counts. Persisted to localStorage key `field_mappings`.

3. **SharePoint** - Multi-method sync panel with 4 methods: Direct URL, Power Automate webhook, Manual CSV upload, Webhook endpoint. Connection status indicator, auto-sync toggle, sync logs with export/clear, configuration tab.

4. **Data** - Data Management: Clear All Data (with confirmation dialog), Scan Duplicates, Detect New Leads, Export Mappings, Refresh Data buttons. Shows data cleared warning. Duplicate records table. New leads detection with mapping interface. Lead name mappings editor with edit dialogs.

5. **Access** - Access Control: User stats (Total/Active/Admins/External), user table with email, role, active toggle, last login, edit/delete actions. Add User dialog. Role permissions descriptions. Uses its own role system (admin/manager/sales_lead/external_partner) separate from auth roles.

6. **Roles** (Master only) - User Roles Management: Lists all demo users with role icons (Crown/Shield/FileCheck/Briefcase/User) and colored badges. Master can change roles via dropdown. SVP role shows additional group assignment dropdown (GES/GDS/GTN/GTS). Explains the two-step approval flow.

7. **Logs** (Master only) - Approval Logs: Chronological list of all approval/reversion actions showing action type, tender ID, performer, role, timestamp, group. Each entry has appropriate icon and colored badge.

8. **Errors** - Error Monitor: Stats (Total/Errors/Warnings/Open), filters (search, level, status), expandable error cards with source badges, stack traces, context JSON, resolve/unresolve/delete actions. Export to CSV. Sample errors initialized on first load. Auto-refreshes every 5 seconds. Global `captureError` and `captureWarning` functions.

9. **Health** - System Health: Overall health score with progress bar, individual metrics (Data Source, Sync Status, Response Time, Memory Usage, Local Storage, Network), uptime chart (24 colored bars). Auto-refreshes every 30 seconds.

10. **Actions** - Quick Actions: 8 action cards (Force Sync, Clear Cache, Clear Logs, Export Data, Validate Data, Rebuild Index, Re-impute, Reset Config) with loading states. Recent admin actions list.

11. **Settings** - Admin Settings with sub-tabs: General (display toggles, currency/date format), Mappings (status mapping table, lead name mapping, group classifications), Imputation (probability by stage, imputation rules descriptions), Notifications (alert toggles, email input).

---

### 17. LEGACY DATA FILE (`opportunityData.ts`)

Contains the full `Opportunity` interface (44 fields including imputation flags), `ImputationLog` and `DataCleaningLog` interfaces, `STATUS_MAPPING` (12 raw statuses to 7 canonical stages), `STAGE_ORDER`, `PROBABILITY_BY_STAGE`, `LEAD_MAPPING` (30+ name variants to 8 canonical names), `GROUP_CLASSIFICATIONS` (GES/GDS/GTN/GTS), date parsing helper, `generateOpportunities()` with 50+ hardcoded sample records, and utility functions: `calculateSummaryStats`, `getLeaderboardData`, `getClientData`, `calculateDataHealth`.

---

### 18. SHAREPOINT SERVICE (`sharePointService.ts`)

Local-storage-based SharePoint sync simulation. Provides: config management (siteUrl, syncMethod, dataEntrySheet, lastSyncTime), sync log CRUD, connection testing, CSV sync, Power Automate sync, sync status, log export. All persisted to localStorage keys `sharepoint_config` and `sharepoint_sync_logs`.

---

### 19. EXPORT BUTTON

Exports TenderData[] to Excel using xlsx library. Columns: Ref No, Tender Name, Client, Type, Lead, Value (with currency conversion), RFP Received, AVENIR STATUS, TENDER RESULT, Submission Near, Approval Status (from ApprovalContext), Tender Status Remark, Remarks/Reason. Auto-sizes columns. Filename includes date.

---

### 20. ROUTING STRUCTURE

```
/login - Login page (public)
/ - Dashboard (protected)
/opportunities - All Tenders (protected)
/tenders - Tenders view (protected)
/clients - Clients (protected)
/analytics - Analytics (protected)
/admin - Admin Panel (protected, master only in UI)
/status/pre-bid - Pre-bid tenders
/status/in-progress - In Progress tenders
/status/submitted - Submitted tenders
/status/awarded - Awarded tenders
/status/lost - Lost/Regretted tenders
/status/on-hold - On Hold tenders
/my-pipeline - My Pipeline (reuses Opportunities)
/team - Team view (reuses Analytics)
/at-risk - At Risk (reuses Opportunities)
* - 404 Not Found
```

Provider nesting order (outermost to innermost): QueryClientProvider -> BrowserRouter -> AuthProvider -> CurrencyProvider -> ApprovalProvider -> DataProvider -> TooltipProvider -> (Toaster + Sonner + Routes)

---

### 21. ADDITIONAL COMPONENTS

- **NavLink** - Custom navigation link component
- **ApprovalStatsWidget** - Card showing Fully Approved / PH Approved (Awaiting SVP) / Pending counts and values with progress bar
- **DataHealthWidget** - Shows health score, imputed count, rows needing attention, export button
- **AdvancedFilters** - Comprehensive filter bar with search, status/group/lead/client popovers with checkboxes, date field selector, date range with presets (This Month, Last Month, This Quarter, etc.) and custom calendar, value range, at-risk/miss-deadline toggles. Expandable section with client type, qualification, partner involvement filters.

---

### 22. IMPORTANT BEHAVIORAL RULES

1. ALL data calculations happen in `dataCollection.ts` - no other file processes raw sheet data
2. When AVENIR STATUS equals TENDER RESULT (case-insensitive), count only once
3. SVPs can only approve tenders matching their assigned group
4. Only Master users can revert approvals
5. Proposal Head approval must happen before SVP approval
6. Currency conversion applies everywhere values are displayed
7. The AED symbol is a custom PNG image, not a text character
8. All state that needs persistence uses localStorage
9. The app works fully offline with mock data as fallback
10. Dark mode class is toggled on documentElement and persisted
