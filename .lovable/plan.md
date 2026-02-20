the search option in vendor page is still not good enough each and every letter should be searchable  
  
Site-Wide Improvements Plan

## Summary

Apply a consistent set of enhancements across **all 6 pages** (Dashboard, Opportunities, Tenders, Clients, Analytics, Vendors) plus global improvements to the sidebar, layout, and shared components.

---

## 1. Vendor Comparison Mode

**Page:** Vendors

- Add a checkbox on each vendor card to select up to 3 vendors
- A floating "Compare (N)" button appears when 2+ selected
- Opens a side-by-side comparison dialog with columns for each vendor showing: Tech Stack, Services, Certifications, Industries, Partners, Company Size, Agreement Status

---

## 2. Smart Search Tags (Quick Filters)

**Pages:** Vendors, Clients, Tenders

- Below the search bar, show clickable chip/tags for the most common search terms extracted from the data
- **Vendors:** "Python", "AWS", "ISO 27001", "Cybersecurity", "Healthcare"
- **Clients:** Top 5 client names as quick-select chips
- **Tenders:** Status chips ("WORKING", "AWARDED", "SUBMITTED") already exist but add quick keyword chips for top leads/clients
- Clicking a chip populates the search bar or toggles a filter

---

## 3. Sort Options

**Pages:** Vendors, Clients, Tenders

- Add a sort dropdown next to the search bar
- **Vendors:** Sort by name (A-Z), company size, number of certifications, tech stack breadth
- **Clients:** Sort by name, total value, opportunity count, win rate
- **Tenders:** Sort by date received, value, status, lead name
- Currently no pages have any sort capability

---

## 4. Grid/List View Toggle

**Pages:** Vendors, Clients

- Add a toggle button (grid icon / list icon) to switch between the card view and a compact table/list view
- Remembers preference in state

---

## 5. Export to Excel

**Pages:** Vendors, Clients, Tenders, Analytics

- Dashboard already has an Export button; extend to all other pages
- **Vendors:** Export filtered vendor list with all fields to XLSX
- **Clients:** Export client summary table
- **Tenders:** Export the filtered tenders table
- **Analytics:** Export chart data as XLSX
- Uses the already-installed `xlsx` library

---

## 6. Relevance Score on Search

**Pages:** Vendors, Clients

- When a search query is active, show a small "N matches" badge on each card indicating how many fields matched
- Helps users quickly identify the best-fit result

---

## 7. Shared Tender Detail Sheet

**Pages:** Dashboard, Opportunities

- Extract the duplicated `<Sheet>` tender detail popup into a shared component `TenderDetailSheet.tsx`
- Both Dashboard.tsx and Opportunities.tsx import it instead of duplicating code

---

## 8. Analytics Page Upgrade

**Page:** Analytics

- Currently uses stale `opportunityData.ts` data instead of the live `tenders` feed from DataContext
- Switch to use `tenders` data from `useData()` and the calculation functions from `dataCollection.ts`
- Add interactive chart clicks (click a pie slice or bar to filter)
- Add currency context support (currently hardcoded to `$`)

---

## 9. Clients Page Upgrade

**Page:** Clients

- Currently uses stale `opportunities` (legacy format) with hardcoded `$` formatting
- Switch to use currency context (`useCurrency()`) for proper AED/USD display
- Add 3D card styling matching the Vendor directory aesthetic
- Make client cards clickable to navigate to Dashboard filtered by that client

---

## 10. Tenders Page Upgrade

**Page:** Tenders

- Currently uses stale `opportunities` (legacy format)
- Switch to use `tenders` from `useData()` directly
- Add column sorting (click headers to sort asc/desc)
- Add export button
- Use currency context instead of hardcoded `$`

---

## Technical Details

### Files to Create


| File                                             | Purpose                    |
| ------------------------------------------------ | -------------------------- |
| `src/components/Dashboard/TenderDetailSheet.tsx` | Shared tender detail popup |
| `src/components/Vendors/VendorCompareDialog.tsx` | Side-by-side comparison    |


### Files to Modify


| File                          | Changes                                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/pages/Vendors.tsx`       | Add comparison mode, sort dropdown, grid/list toggle, quick-filter tags, export button, relevance score |
| `src/pages/Clients.tsx`       | 3D cards, sort dropdown, grid/list toggle, export, currency context, click-to-filter                    |
| `src/pages/Tenders.tsx`       | Switch to TenderData, column sorting, export button, currency context                                   |
| `src/pages/Analytics.tsx`     | Switch to live tenders data, currency context, interactive chart clicks                                 |
| `src/pages/Dashboard.tsx`     | Use shared TenderDetailSheet                                                                            |
| `src/pages/Opportunities.tsx` | Use shared TenderDetailSheet                                                                            |
| `src/data/vendorData.ts`      | Add relevance scoring to `searchVendors()`                                                              |


### Dependencies

No new dependencies needed. `xlsx` and `recharts` are already installed.

### Sequencing

1. Create shared `TenderDetailSheet` first (unblocks Dashboard + Opportunities cleanup)
2. Fix data source on Tenders, Clients, Analytics pages (switch from legacy `opportunities` to `tenders`)
3. Add sort/export/view-toggle to each page in parallel
4. Add vendor comparison mode last (most complex)