

# Responsive QA Fix — Whole App

## Summary

Fix 7 responsive issues across Dashboard, AdvancedFilters, KPICards, OpportunitiesTable, Opportunities, Admin, and Analytics pages. All changes are CSS/layout-only with one structural addition (mobile card view for the table).

---

## 1. Dashboard Header & Summary Bars (Dashboard.tsx)

**Problem:** Header row and floating summary bar use `flex justify-between` with no wrapping — overflows on mobile.

**Fix:**
- Header: `flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`
- Hide "Refresh Data" text on mobile, show icon-only: `<span className="hidden sm:inline">Refresh Data</span>`
- Summary bar: `flex flex-wrap items-center gap-2 sm:gap-4` — hide dividers on mobile with `hidden sm:block`, use `gap-x-4 gap-y-1`

---

## 2. AdvancedFilters Fluid on Small Screens (AdvancedFilters.tsx)

**Problem:** Search input has `min-w-[200px]` causing overflow. Filter buttons crowd horizontally.

**Fix:**
- Search: change `min-w-[200px]` → `min-w-0 w-full sm:min-w-[200px] sm:max-w-sm`
- Outer container: ensure `flex-wrap` is already there (it is), add `gap-2` consistency
- On the expanded filter section, change grid to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` instead of jumping to 4+ columns early

---

## 3. KPI Cards Responsive Grid (KPICards.tsx)

**Problem:** `grid-cols-2 sm:grid-cols-5 lg:grid-cols-10` — 5 cols at 640px is too cramped for 10 KPI cards.

**Fix:**
- Change to `grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-3`
- Add `overflow-x-auto` wrapper as fallback so cards can scroll horizontally on very small screens
- Reduce card padding on mobile: `p-2 sm:p-3`

---

## 4. OpportunitiesTable Mobile Card View (OpportunitiesTable.tsx)

**Problem:** 11-column table with only `overflow-auto` — unusable on mobile.

**Fix:**
- Add `useIsMobile()` hook (already exists at `src/hooks/use-mobile.tsx`)
- On mobile (`< 768px`): render a stacked card list instead of the table. Each card shows: Ref No, Client, Status badge, Value, Lead — tappable to select
- On desktop: keep existing table unchanged
- Share the same `filteredData`, search, and status filter controls

---

## 5. Opportunities Page vh Fix (Opportunities.tsx)

**Problem:** Currently no `h-[calc(100vh-...)]` in the current code (it's a simple `space-y-6` div), but the child table's `max-h-[400px]` is fine. If any vh usage exists elsewhere, replace.

**Fix:**
- The page itself is clean. The table inside uses `max-h-[400px]` which is fine.
- Wrap the header in `flex flex-col sm:flex-row` for mobile stacking (title + export button)

---

## 6. Admin Page Fixed Widths (Admin.tsx)

**Problem:** Fixed `w-[180px]`, `w-[140px]`, `w-[100px]` on selects/controls — overflow on mobile.

**Fix:**
- Replace all fixed-width selects with `w-full sm:w-[180px]` (or appropriate size)
- Wrap action button rows in `flex flex-wrap gap-2`
- Admin tables: add `overflow-x-auto` wrapper

---

## 7. Analytics Charts Mobile Config (Analytics.tsx)

**Problem:** Charts use fixed `h-[300px]`, legend always visible, YAxis width fixed at 50.

**Fix:**
- Chart containers: `h-[250px] sm:h-[300px]`
- Hide `<Legend>` on mobile using a conditional: `{!isMobile && <Legend />}`
- YAxis: `width={isMobile ? 35 : 50}` and `tick={{ fontSize: isMobile ? 10 : 12 }}`
- Summary grid: already `grid-cols-2 md:grid-cols-4` — this is fine

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Dashboard.tsx` | Wrap header/summary in responsive flex classes |
| `src/components/Dashboard/AdvancedFilters.tsx` | Remove rigid min-width, fluid grid breakpoints |
| `src/components/Dashboard/KPICards.tsx` | Better breakpoint progression, horizontal scroll fallback |
| `src/components/Dashboard/OpportunitiesTable.tsx` | Add mobile card view using `useIsMobile()` |
| `src/pages/Opportunities.tsx` | Responsive header stacking |
| `src/pages/Admin.tsx` | Replace fixed widths with responsive classes |
| `src/pages/Analytics.tsx` | Mobile chart config (smaller height, hide legend, narrower axis) |

No new files or dependencies needed.

