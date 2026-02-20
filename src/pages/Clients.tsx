import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Search, TrendingUp, FileText, DollarSign, Download, LayoutGrid, List, X, ChevronRight } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

type SortOption = 'value' | 'name' | 'count' | 'winRate';
type ViewMode = 'grid' | 'list';

const Clients = () => {
  const { tenders } = useData();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('value');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const clientStats = useMemo(() => {
    const stats: Record<string, {
      count: number; value: number; won: number; lost: number; inProgress: number; submitted: number;
    }> = {};

    tenders.forEach(t => {
      if (!t.client) return;
      if (!stats[t.client]) stats[t.client] = { count: 0, value: 0, won: 0, lost: 0, inProgress: 0, submitted: 0 };
      stats[t.client].count++;
      stats[t.client].value += t.value;
      const s = (t.avenirStatus || '').toUpperCase();
      if (s === 'AWARDED') stats[t.client].won++;
      if (s === 'LOST' || s === 'REGRETTED') stats[t.client].lost++;
      if (s === 'WORKING' || s === 'ONGOING' || s === 'TO START') stats[t.client].inProgress++;
      if (s === 'SUBMITTED') stats[t.client].submitted++;
    });

    return Object.entries(stats)
      .map(([name, data]) => ({
        name, ...data,
        winRate: data.won + data.lost > 0 ? Math.round((data.won / (data.won + data.lost)) * 100) : 0,
      }));
  }, [tenders]);

  const filteredClients = useMemo(() => {
    let data = clientStats;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(c => c.name.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'count': return b.count - a.count;
        case 'winRate': return b.winRate - a.winRate;
        default: return b.value - a.value;
      }
    });
    return data;
  }, [clientStats, search, sortBy]);

  const totalValue = clientStats.reduce((sum, c) => sum + c.value, 0);
  const totalOpps = clientStats.reduce((sum, c) => sum + c.count, 0);
  const maxValue = Math.max(...clientStats.map(c => c.value), 1);

  // Quick filter chips: top 5 clients
  const quickChips = useMemo(() => {
    return [...clientStats].sort((a, b) => b.value - a.value).slice(0, 5).map(c => c.name);
  }, [clientStats]);

  const handleExport = () => {
    const exportData = filteredClients.map(c => ({
      'Client': c.name,
      'Opportunities': c.count,
      'Total Value': c.value,
      'Won': c.won,
      'Lost': c.lost,
      'In Progress': c.inProgress,
      'Submitted': c.submitted,
      'Win Rate': `${c.winRate}%`,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'clients-export.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Clients
          </h1>
          <p className="text-muted-foreground">{filteredClients.length} clients in your pipeline</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Export XLSX
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-primary">{clientStats.length}</p>
          <p className="text-xs text-muted-foreground">Total Clients</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold">{totalOpps}</p>
          <p className="text-xs text-muted-foreground">Total Opportunities</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-success">{formatCurrency(totalValue)}</p>
          <p className="text-xs text-muted-foreground">Pipeline Value</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 text-center">
          <p className="text-2xl font-bold text-warning">{clientStats.length > 0 ? formatCurrency(totalValue / clientStats.length) : '$0'}</p>
          <p className="text-xs text-muted-foreground">Avg per Client</p>
        </CardContent></Card>
      </div>

      {/* Search + Sort + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          {search && (
            <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0" onClick={() => setSearch('')}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="value">Value (High-Low)</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="count">Opportunities</SelectItem>
            <SelectItem value="winRate">Win Rate</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border rounded-md">
          <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="rounded-r-none" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="rounded-l-none" onClick={() => setViewMode('list')}>
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Filter Chips */}
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

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client, index) => (
            <Card
              key={client.name}
              className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] relative overflow-hidden border-border/60"
              onClick={() => navigate(`/?client=${encodeURIComponent(client.name)}`)}
            >
              <div className="h-1 w-full bg-gradient-to-r from-primary via-info to-accent" />
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      {index + 1}
                    </span>
                    <CardTitle className="text-base truncate max-w-[180px] group-hover:text-primary transition-colors">{client.name}</CardTitle>
                  </div>
                  {client.winRate > 0 && (
                    <Badge variant={client.winRate >= 50 ? "default" : "secondary"}>
                      {client.winRate}% win
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{client.count} opportunities</span>
                  <span className="font-semibold">{formatCurrency(client.value)}</span>
                </div>
                <Progress value={(client.value / maxValue) * 100} className="h-1.5" />
                <div className="flex gap-2 flex-wrap">
                  {client.won > 0 && <Badge variant="outline" className="text-success border-success/30 bg-success/10 text-xs">{client.won} Won</Badge>}
                  {client.submitted > 0 && <Badge variant="outline" className="text-info border-info/30 bg-info/10 text-xs">{client.submitted} Submitted</Badge>}
                  {client.inProgress > 0 && <Badge variant="outline" className="text-warning border-warning/30 bg-warning/10 text-xs">{client.inProgress} In Progress</Badge>}
                  {client.lost > 0 && <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-xs">{client.lost} Lost</Badge>}
                </div>
                <div className="flex items-center justify-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity pt-1">
                  View in Dashboard <ChevronRight className="h-3 w-3 ml-0.5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-center">Opportunities</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-center">Won</TableHead>
                  <TableHead className="text-center">Lost</TableHead>
                  <TableHead className="text-center">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.map((client, i) => (
                  <TableRow
                    key={client.name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/?client=${encodeURIComponent(client.name)}`)}
                  >
                    <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-center">{client.count}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(client.value)}</TableCell>
                    <TableCell className="text-center text-success">{client.won}</TableCell>
                    <TableCell className="text-center text-destructive">{client.lost}</TableCell>
                    <TableCell className="text-center">
                      {client.winRate > 0 ? (
                        <Badge variant={client.winRate >= 50 ? "default" : "secondary"} className="text-xs">{client.winRate}%</Badge>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Clients;
