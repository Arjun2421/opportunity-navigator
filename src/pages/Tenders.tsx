import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileSpreadsheet, Calendar, Clock, AlertTriangle, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown, Download, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';

type SortField = 'refNo' | 'tenderName' | 'client' | 'status' | 'dateReceived' | 'value' | 'lead';
type SortDir = 'asc' | 'desc';

const Tenders = () => {
  const { tenders } = useData();
  const { formatCurrency } = useCurrency();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('refNo');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    tenders.forEach(t => {
      const s = t.avenirStatus || 'UNKNOWN';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [tenders]);

  const filteredData = useMemo(() => {
    let data = [...tenders];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(t =>
        (t.tenderName || '').toLowerCase().includes(q) ||
        (t.refNo || '').toLowerCase().includes(q) ||
        (t.client || '').toLowerCase().includes(q) ||
        (t.lead || '').toLowerCase().includes(q)
      );
    }

    if (statusFilter) {
      data = data.filter(t => t.avenirStatus === statusFilter);
    }

    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'value': cmp = a.value - b.value; break;
        case 'dateReceived': cmp = (a.rfpReceivedDate || '').localeCompare(b.rfpReceivedDate || ''); break;
        case 'client': cmp = (a.client || '').localeCompare(b.client || ''); break;
        case 'tenderName': cmp = (a.tenderName || '').localeCompare(b.tenderName || ''); break;
        case 'status': cmp = (a.avenirStatus || '').localeCompare(b.avenirStatus || ''); break;
        case 'lead': cmp = (a.lead || '').localeCompare(b.lead || ''); break;
        default: cmp = (a.refNo || '').localeCompare(b.refNo || ''); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [tenders, search, statusFilter, sortField, sortDir]);

  const upcomingDeadlines = useMemo(() => {
    return tenders
      .filter(t => t.isSubmissionNear)
      .slice(0, 5);
  }, [tenders]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === 'asc' ? <ArrowUp className="h-3 w-3 ml-1 text-primary" /> : <ArrowDown className="h-3 w-3 ml-1 text-primary" />;
  };

  const handleExport = () => {
    const exportData = filteredData.map(t => ({
      'Ref No': t.refNo,
      'Tender Name': t.tenderName,
      'Client': t.client,
      'Status': t.avenirStatus,
      'Result': t.tenderResult,
      'RFP Received': t.rfpReceivedDate || '',
      'Lead': t.lead,
      'Value': t.value,
      'Group': t.groupClassification,
      'Remarks': t.remarksReason,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tenders');
    XLSX.writeFile(wb, 'tenders-export.xlsx');
  };

  // Quick filter chips for top leads/clients
  const quickChips = useMemo(() => {
    const leads: Record<string, number> = {};
    tenders.forEach(t => { if (t.lead) leads[t.lead] = (leads[t.lead] || 0) + 1; });
    return Object.entries(leads).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name]) => name);
  }, [tenders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-primary" />
            Tenders
          </h1>
          <p className="text-muted-foreground">{filteredData.length} of {tenders.length} tenders</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export XLSX
        </Button>
      </div>

      {/* Status Pills */}
      <div className="flex flex-wrap gap-2">
        <Button variant={statusFilter === null ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(null)}>
          All ({tenders.length})
        </Button>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Button key={status} variant={statusFilter === status ? "default" : "outline"} size="sm" onClick={() => setStatusFilter(statusFilter === status ? null : status)}>
            {status} ({count})
          </Button>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-warning">
              <Clock className="h-4 w-4" /> Upcoming Submission Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {upcomingDeadlines.map((t) => (
                <Badge key={t.id} variant="outline" className="py-2 px-3 border-warning/50">
                  <div className="text-left">
                    <p className="font-medium text-xs">{t.refNo}</p>
                    <p className="text-xs text-muted-foreground">{t.client}</p>
                  </div>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Quick Chips */}
      <div className="space-y-2">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tenders, clients, leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          {search && (
            <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => setSearch('')}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map(chip => (
            <Badge
              key={chip}
              variant={search === chip ? "default" : "secondary"}
              className="cursor-pointer text-xs hover:bg-primary/20"
              onClick={() => setSearch(search === chip ? '' : chip)}
            >
              {chip}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tender Table with Sortable Headers */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('refNo')}>
                  <span className="flex items-center">Ref No. <SortIcon field="refNo" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('tenderName')}>
                  <span className="flex items-center">Name <SortIcon field="tenderName" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('client')}>
                  <span className="flex items-center">Client <SortIcon field="client" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('status')}>
                  <span className="flex items-center">Status <SortIcon field="status" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('dateReceived')}>
                  <span className="flex items-center">Received <SortIcon field="dateReceived" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('lead')}>
                  <span className="flex items-center">Lead <SortIcon field="lead" /></span>
                </TableHead>
                <TableHead className="cursor-pointer select-none text-right" onClick={() => toggleSort('value')}>
                  <span className="flex items-center justify-end">Value <SortIcon field="value" /></span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((tender) => (
                <TableRow key={tender.id} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm">{tender.refNo}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{tender.tenderName}</TableCell>
                  <TableCell>{tender.client}</TableCell>
                  <TableCell>
                    <Badge variant={
                      tender.avenirStatus === 'AWARDED' ? 'default' :
                      tender.avenirStatus === 'LOST' || tender.avenirStatus === 'REGRETTED' ? 'destructive' :
                      'secondary'
                    }>
                      {tender.avenirStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tender.rfpReceivedDate || '-'}
                  </TableCell>
                  <TableCell className="text-sm">{tender.lead || '-'}</TableCell>
                  <TableCell className="text-right font-medium">
                    {tender.value > 0 ? formatCurrency(tender.value) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tenders;
