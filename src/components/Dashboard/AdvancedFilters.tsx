import { useState, useMemo } from "react";
import { Search, Filter, X, Calendar, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, subQuarters, subYears } from "date-fns";
import { TenderData } from "@/services/dataCollection";

type DatePreset = "all" | "thisMonth" | "lastMonth" | "thisQuarter" | "lastQuarter" | "thisYear" | "lastYear" | "custom";

const GROUP_CLASSIFICATIONS = ['GES', 'GDS', 'GTN', 'GTS'];
const STAGE_ORDER = ['WORKING', 'SUBMITTED', 'AWARDED', 'LOST', 'REGRETTED', 'TO START', 'ONGOING', 'HOLD / CLOSED'];

const getDateRangeFromPreset = (preset: DatePreset): { from: Date | undefined; to: Date | undefined } => {
  const now = new Date();
  switch (preset) {
    case "thisMonth": return { from: startOfMonth(now), to: endOfMonth(now) };
    case "lastMonth": { const d = subMonths(now, 1); return { from: startOfMonth(d), to: endOfMonth(d) }; }
    case "thisQuarter": return { from: startOfQuarter(now), to: endOfQuarter(now) };
    case "lastQuarter": { const d = subQuarters(now, 1); return { from: startOfQuarter(d), to: endOfQuarter(d) }; }
    case "thisYear": return { from: startOfYear(now), to: endOfYear(now) };
    case "lastYear": { const d = subYears(now, 1); return { from: startOfYear(d), to: endOfYear(d) }; }
    default: return { from: undefined, to: undefined };
  }
};

const getPresetLabel = (preset: DatePreset): string => {
  const labels: Record<DatePreset, string> = {
    all: "All Time", thisMonth: "This Month", lastMonth: "Last Month",
    thisQuarter: "This Quarter", lastQuarter: "Last Quarter",
    thisYear: "This Year", lastYear: "Last Year", custom: "Custom Range",
  };
  return labels[preset];
};

export interface FilterState {
  search: string;
  statuses: string[];
  groups: string[];
  leads: string[];
  clients: string[];
  dateRange: { from: Date | undefined; to: Date | undefined };
  datePreset: DatePreset;
  valueRange: { min: number | undefined; max: number | undefined };
  showSubmissionNear: boolean;
}

export const defaultFilters: FilterState = {
  search: "", statuses: [], groups: [], leads: [], clients: [],
  dateRange: { from: undefined, to: undefined }, datePreset: "all",
  valueRange: { min: undefined, max: undefined }, showSubmissionNear: false,
};

interface AdvancedFiltersProps {
  data: TenderData[];
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export function AdvancedFilters({ data, filters, onFiltersChange, onClearFilters }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const uniqueValues = useMemo(() => ({
    leads: [...new Set(data.map(o => o.lead).filter(Boolean))].sort(),
    clients: [...new Set(data.map(o => o.client).filter(Boolean))].sort(),
  }), [data]);

  const activeFilterCount = useMemo(() => {
    let c = 0;
    if (filters.search) c++;
    if (filters.statuses.length) c++;
    if (filters.groups.length) c++;
    if (filters.leads.length) c++;
    if (filters.clients.length) c++;
    if (filters.dateRange.from || filters.dateRange.to) c++;
    if (filters.valueRange.min !== undefined || filters.valueRange.max !== undefined) c++;
    if (filters.showSubmissionNear) c++;
    return c;
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayValue = (key: "statuses" | "groups" | "leads" | "clients", value: string) => {
    const current = filters[key];
    updateFilter(key, current.includes(value) ? current.filter(v => v !== value) : [...current, value]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tenders, clients, ref..." value={filters.search} onChange={e => updateFilter("search", e.target.value)} className="pl-10" />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Status
              {filters.statuses.length > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{filters.statuses.length}</Badge>}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56">
            <div className="space-y-2">
              {STAGE_ORDER.map(status => (
                <div key={status} className="flex items-center gap-2">
                  <Checkbox id={`status-${status}`} checked={filters.statuses.includes(status)} onCheckedChange={() => toggleArrayValue("statuses", status)} />
                  <Label htmlFor={`status-${status}`} className="text-sm cursor-pointer">{status}</Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Group
              {filters.groups.length > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{filters.groups.length}</Badge>}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="space-y-2">
              {GROUP_CLASSIFICATIONS.map(group => (
                <div key={group} className="flex items-center gap-2">
                  <Checkbox id={`group-${group}`} checked={filters.groups.includes(group)} onCheckedChange={() => toggleArrayValue("groups", group)} />
                  <Label htmlFor={`group-${group}`} className="text-sm cursor-pointer">{group}</Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Lead
              {filters.leads.length > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{filters.leads.length}</Badge>}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 max-h-64 overflow-auto">
            <div className="space-y-2">
              {uniqueValues.leads.map(lead => (
                <div key={lead} className="flex items-center gap-2">
                  <Checkbox id={`lead-${lead}`} checked={filters.leads.includes(lead)} onCheckedChange={() => toggleArrayValue("leads", lead)} />
                  <Label htmlFor={`lead-${lead}`} className="text-sm cursor-pointer">{lead}</Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              Client
              {filters.clients.length > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{filters.clients.length}</Badge>}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 max-h-64 overflow-auto">
            <div className="space-y-2">
              {uniqueValues.clients.map(client => (
                <div key={client} className="flex items-center gap-2">
                  <Checkbox id={`client-${client}`} checked={filters.clients.includes(client)} onCheckedChange={() => toggleArrayValue("clients", client)} />
                  <Label htmlFor={`client-${client}`} className="text-sm cursor-pointer truncate">{client}</Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {filters.datePreset === "custom" && filters.dateRange.from
                ? <span>{format(filters.dateRange.from, "MMM d")}{filters.dateRange.to && ` - ${format(filters.dateRange.to, "MMM d")}`}</span>
                : getPresetLabel(filters.datePreset)}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-1">
                {(["all", "thisMonth", "lastMonth", "thisQuarter", "lastQuarter", "thisYear", "lastYear"] as DatePreset[]).map(preset => (
                  <Button key={preset} variant={filters.datePreset === preset ? "default" : "ghost"} size="sm" className="justify-start text-xs"
                    onClick={() => onFiltersChange({ ...filters, datePreset: preset, dateRange: getDateRangeFromPreset(preset) })}>
                    {getPresetLabel(preset)}
                  </Button>
                ))}
                <Button variant={filters.datePreset === "custom" ? "default" : "ghost"} size="sm" className="justify-start text-xs"
                  onClick={() => onFiltersChange({ ...filters, datePreset: "custom" })}>
                  Custom Range
                </Button>
              </div>
              <Separator />
              {filters.datePreset === "custom" && (
                <CalendarComponent
                  mode="range"
                  selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
                  onSelect={range => onFiltersChange({ ...filters, datePreset: "custom", dateRange: { from: range?.from, to: range?.to } })}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="gap-2">
          <Filter className="h-3.5 w-3.5" />
          More Filters
          {activeFilterCount > 0 && <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">{activeFilterCount}</Badge>}
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1 text-muted-foreground">
            <X className="h-3.5 w-3.5" />Clear All
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-1">
            <Label className="text-xs">Min Value</Label>
            <Input type="number" placeholder="0" className="w-32 h-8" value={filters.valueRange.min ?? ""}
              onChange={e => updateFilter("valueRange", { ...filters.valueRange, min: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Max Value</Label>
            <Input type="number" placeholder="∞" className="w-32 h-8" value={filters.valueRange.max ?? ""}
              onChange={e => updateFilter("valueRange", { ...filters.valueRange, max: e.target.value ? Number(e.target.value) : undefined })} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Flags</Label>
            <div className="flex items-center gap-2">
              <Checkbox id="submissionNear" checked={filters.showSubmissionNear} onCheckedChange={checked => updateFilter("showSubmissionNear", !!checked)} />
              <Label htmlFor="submissionNear" className="text-sm cursor-pointer">Submission Near Only</Label>
            </div>
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.search && <Badge variant="secondary" className="gap-1">Search: "{filters.search}"<X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("search", "")} /></Badge>}
          {filters.statuses.map(s => <Badge key={s} variant="secondary" className="gap-1">{s}<X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayValue("statuses", s)} /></Badge>)}
          {filters.groups.map(g => <Badge key={g} variant="secondary" className="gap-1">{g}<X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayValue("groups", g)} /></Badge>)}
          {filters.leads.map(l => <Badge key={l} variant="secondary" className="gap-1">Lead: {l}<X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayValue("leads", l)} /></Badge>)}
          {filters.clients.map(c => <Badge key={c} variant="secondary" className="gap-1">Client: {c}<X className="h-3 w-3 cursor-pointer" onClick={() => toggleArrayValue("clients", c)} /></Badge>)}
          {filters.showSubmissionNear && <Badge variant="secondary" className="gap-1">Submission Near<X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("showSubmissionNear", false)} /></Badge>}
        </div>
      )}
    </div>
  );
}

export function applyFilters(data: TenderData[], filters: FilterState): TenderData[] {
  return data.filter(t => {
    if (filters.search) {
      const s = filters.search.toLowerCase();
      if (!(t.tenderName?.toLowerCase().includes(s) || t.client?.toLowerCase().includes(s) || t.refNo?.toLowerCase().includes(s) || t.lead?.toLowerCase().includes(s))) return false;
    }
    if (filters.statuses.length > 0) {
      const match = filters.statuses.some(status => {
        if (status === 'LOST') return t.tenderResult?.toUpperCase() === 'LOST' || t.avenirStatus?.toUpperCase() === 'LOST';
        if (status === 'ONGOING') return t.tenderResult?.toUpperCase() === 'ONGOING' || t.avenirStatus?.toUpperCase() === 'ONGOING';
        return t.avenirStatus?.toUpperCase() === status;
      });
      if (!match) return false;
    }
    if (filters.groups.length > 0 && !filters.groups.includes(t.groupClassification)) return false;
    if (filters.leads.length > 0 && !filters.leads.includes(t.lead)) return false;
    if (filters.clients.length > 0 && !filters.clients.includes(t.client)) return false;
    if (filters.dateRange.from || filters.dateRange.to) {
      const d = t.rfpReceivedDate ? new Date(t.rfpReceivedDate) : null;
      if (!d) return false;
      if (filters.dateRange.from && d < filters.dateRange.from) return false;
      if (filters.dateRange.to && d > filters.dateRange.to) return false;
    }
    if (filters.valueRange.min !== undefined && t.value < filters.valueRange.min) return false;
    if (filters.valueRange.max !== undefined && t.value > filters.valueRange.max) return false;
    if (filters.showSubmissionNear && !t.isSubmissionNear) return false;
    return true;
  });
}
