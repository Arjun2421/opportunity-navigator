

# Replace Google Sheets with Microsoft Graph API + MongoDB Atlas

## Overview

Remove all Google Sheets integration and replace it with:
- **Edge functions** (via Lovable Cloud) that securely call Microsoft Graph API to read Excel data from SharePoint/OneDrive
- **MongoDB Atlas** as the persistent data store for tender records
- Updated Admin panel reflecting the new data source

## Prerequisites (User Actions Required)

1. **Enable Lovable Cloud** -- click the Cloud tab in the left panel to activate backend functions
2. **Provide secrets** (after Cloud is enabled):
   - `AZURE_CLIENT_ID` = `b507bc53-ce4a-48cb-9fd2-6aa8c8e10464`
   - `AZURE_CLIENT_SECRET` = your Azure app secret
   - `AZURE_TENANT_ID` = `18308545-013f-4a2f-9774-5516497b3c54`
   - `MONGODB_URI` = your MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/tenders`)
   - `SHAREPOINT_FILE_URL` = the SharePoint sharing URL for the Excel file

## Architecture

```text
Browser (React App)
    |
    | fetch("/api/sync-tenders")    fetch("/api/get-tenders")
    v
Edge Functions (Lovable Cloud)
    |                    |
    | MSAL auth          | MongoDB driver
    v                    v
Microsoft Graph API    MongoDB Atlas
(read Excel data)      (store/retrieve tenders)
```

## Implementation Steps

### Step 1: Enable Lovable Cloud and Add Secrets
- Enable Cloud for edge function support
- Store Azure credentials and MongoDB URI as secrets

### Step 2: Create Edge Function -- `sync-tenders`
- Authenticates with Microsoft Graph API using MSAL client credentials flow
- Resolves the SharePoint file URL to drive/file IDs
- Reads the Excel workbook via Graph API (`/workbook/worksheets/.../usedRange`)
- Parses rows using the same column-mapping logic currently in `dataCollection.ts`
- Upserts parsed tender records into MongoDB Atlas collection `tenders`
- Returns sync summary (rows synced, errors, timestamp)

### Step 3: Create Edge Function -- `get-tenders`
- Reads all tender documents from MongoDB `tenders` collection
- Returns them as JSON to the frontend
- Supports optional query parameters for filtering

### Step 4: Update `dataCollection.ts`
- Remove Google Sheets fetch (`fetchGoogleSheetsData`)
- Remove Google API key, spreadsheet ID, sheet name constants
- Replace with `fetchTendersFromAPI()` that calls the `get-tenders` edge function
- Keep all existing interfaces (`TenderData`, `KPIStats`, `FunnelData`, `ClientData`)
- Keep all calculation functions (`calculateKPIStats`, `calculateFunnelData`, `getClientData`, etc.)
- Keep mock data fallback for offline/development use
- Keep date parsing, status deduplication, and submission-near logic

### Step 5: Update `DataContext.tsx`
- Change `refreshData()` to call the new API endpoint
- Add a `syncFromSource()` function that triggers the `sync-tenders` edge function (admin only)

### Step 6: Update Admin Panel
- **Replace "Sheets" tab** with "Graph API" tab showing:
  - Connection status (connected to SharePoint via Graph API)
  - "Sync Now" button that triggers the `sync-tenders` edge function
  - Last sync timestamp from MongoDB
  - File name and sheet info from the connected Excel file
  - Error display if sync fails
- **Remove** `GoogleSheetsSync.tsx` component
- **Create** `GraphAPISync.tsx` component
- Update references in `Admin.tsx`

### Step 7: Update Dashboard text
- Change "loaded from Google Sheets" to "loaded from database"
- Update error messages to reference Graph API instead of Google Sheets

### Step 8: Cleanup
- Remove Google Sheets API key from codebase
- Remove `gsheets_connection` localStorage references
- Update the Data Mapping panel to reference the new source

## Files Changed

| Action | File |
|--------|------|
| Create | `supabase/functions/sync-tenders/index.ts` |
| Create | `supabase/functions/get-tenders/index.ts` |
| Create | `src/components/Admin/GraphAPISync.tsx` |
| Delete | `src/components/Admin/GoogleSheetsSync.tsx` |
| Edit   | `src/services/dataCollection.ts` |
| Edit   | `src/contexts/DataContext.tsx` |
| Edit   | `src/pages/Admin.tsx` |
| Edit   | `src/pages/Dashboard.tsx` |
| Edit   | `src/components/Admin/DataMappingPanel.tsx` |

## What Stays the Same

Everything else in the app remains unchanged:
- Authentication system (5 roles, demo users)
- Two-step approval workflow
- Currency context (USD/AED)
- All KPI calculations, funnel data, client leaderboard
- OpportunitiesTable with approval cells
- All other 10 admin tabs (Mapping, SharePoint, Data, Access, Roles, Logs, Errors, Health, Actions, Settings)
- Sidebar, routing, theming
- Export functionality
- Mock data fallback

## Technical Notes

- Edge functions use Deno runtime with `npm:mongodb` driver for MongoDB Atlas
- MSAL client credentials flow (no user interaction needed) via `npm:@azure/msal-node`
- The Graph API reads the Excel file using the sharing URL resolution pattern from your Python script
- MongoDB stores documents matching the existing `TenderData` interface
- CORS headers configured for the preview domain

