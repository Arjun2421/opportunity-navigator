import { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { getProjectUpdates, addProjectUpdate, getUpdateCount, getLastUpdate, getUpdatesForTender, ProjectUpdate } from '@/data/projectUpdatesData';
import { TenderData } from '@/services/dataCollection';
import { AddUpdateForm } from '@/components/ProjectTracker/AddUpdateForm';
import { ProjectUpdateTimeline } from '@/components/ProjectTracker/ProjectUpdateTimeline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, FileText, Activity, Award, DollarSign, Search, Download, RefreshCw, Plus, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const STATUS_COLORS: Record<string, string> = {
  'AWARDED': 'bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30',
  'WORKING': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  'ONGOING': 'bg-[hsl(var(--info))]/15 text-[hsl(var(--info))] border-[hsl(var(--info))]/30',
  'SUBMITTED': 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  'TO START': 'bg-cyan-500/15 text-cyan-500 border-cyan-500/30',
  'LOST': 'bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30',
  'REGRETTED': 'bg-slate-500/15 text-slate-500 border-slate-500/30',
  'HOLD/CLOSED': 'bg-muted text-muted-foreground border-border',
};

export default function ProjectTracker() {
  const { user, isMaster } = useAuth();
  const { tenders } = useData();
  const [allUpdates, setAllUpdates] = useState<ProjectUpdate[]>(getProjectUpdates());
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState<TenderData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setAllUpdates(getProjectUpdates());
    setRefreshKey(k => k + 1);
  }, []);

  const filtered = useMemo(() => {
    let list = tenders;
    if (groupFilter !== 'all') list = list.filter(t => t.groupClassification === groupFilter);
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(t =>
        t.client.toLowerCase().includes(s) || t.refNo.toLowerCase().includes(s) ||
        t.tenderName.toLowerCase().includes(s) || t.lead.toLowerCase().includes(s)
      );
    }
    return list;
  }, [tenders, groupFilter, search, refreshKey]);

  const stats = useMemo(() => {
    const active = filtered.filter(t => ['WORKING', 'ONGOING', 'SUBMITTED'].includes(t.avenirStatus.toUpperCase()));
    const awarded = filtered.filter(t => t.avenirStatus.toUpperCase() === 'AWARDED');
    return {
      total: filtered.length,
      active: active.length,
      awarded: awarded.length,
      totalValue: filtered.reduce((s, t) => s + (t.value || 0), 0),
    };
  }, [filtered]);

  const handleAddSubmit = useCallback((data: Omit<ProjectUpdate, 'id' | 'createdAt'>) => {
    addProjectUpdate(data);
    refresh();
    setAddOpen(false);
  }, [refresh]);

  if (!isMaster) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8">
            <Shield className="h-16 w-16 text-destructive/50" />
            <h2 className="text-xl font-bold">Access Denied</h2>
            <p className="text-sm text-muted-foreground text-center">Only Master users can access the Project Tracker.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  const exportCSV = () => {
    const header = 'Ref No,Received Date,Tender Name,Client,Lead,Value,Status,Group,Updates Count,Last Update,Last Update Type\n';
    const rows = filtered.map(t => {
      const last = getLastUpdate(t.id);
      return [
        t.refNo, t.rfpReceivedDate || '', `"${t.tenderName}"`, `"${t.client}"`, t.lead,
        t.value, t.avenirStatus, t.groupClassification, getUpdateCount(t.id),
        last ? new Date(last.createdAt).toLocaleDateString() : '', last?.updateType || ''
      ].join(',');
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `project-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const openTimeline = (t: TenderData) => { setSelectedTender(t); setTimelineOpen(true); };
  const openAdd = (t: TenderData) => { setSelectedTender(t); setAddOpen(true); };

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Project Tracker</h1>
          <p className="text-sm text-muted-foreground">Track vendor interactions and project milestones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-3.5 w-3.5 mr-1" />Export CSV</Button>
          <Button variant="outline" size="sm" onClick={refresh}><RefreshCw className="h-3.5 w-3.5 mr-1" />Refresh</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Projects', value: stats.total, icon: FileText, color: 'text-primary' },
          { label: 'Active', value: stats.active, icon: Activity, color: 'text-amber-500' },
          { label: 'Awarded', value: stats.awarded, icon: Award, color: 'text-[hsl(var(--success))]' },
          { label: 'Total Value', value: `$${(stats.totalValue / 1e6).toFixed(1)}M`, icon: DollarSign, color: 'text-[hsl(var(--info))]' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by client, ref, name, lead..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {['GES', 'GDS', 'GTN', 'GTS'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Ref No</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Updates</TableHead>
                <TableHead>Last Update</TableHead>
                <TableHead className="w-20">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(t => {
                const count = getUpdateCount(t.id);
                const last = getLastUpdate(t.id);
                const statusUpper = t.avenirStatus.toUpperCase();
                return (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openTimeline(t)}>
                    <TableCell className="font-mono text-xs">{t.refNo}</TableCell>
                    <TableCell className="text-xs">{t.rfpReceivedDate ? format(new Date(t.rfpReceivedDate), 'dd MMM yy') : '—'}</TableCell>
                    <TableCell className="text-sm font-medium max-w-[200px] truncate">{t.tenderName}</TableCell>
                    <TableCell className="text-sm max-w-[140px] truncate">{t.client}</TableCell>
                    <TableCell className="text-xs">{t.lead}</TableCell>
                    <TableCell className="text-right text-xs font-mono">${(t.value || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[statusUpper] || ''}`}>{t.avenirStatus}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {count > 0 ? <Badge variant="secondary" className="text-[10px]">{count}</Badge> : <span className="text-muted-foreground text-xs">—</span>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {last ? format(new Date(last.createdAt), 'dd MMM') : '—'}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm" variant="ghost" className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); openAdd(t); }}
                      >
                        <Plus className="h-3 w-3 mr-1" />Update
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">No tenders found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Timeline Dialog */}
      <Dialog open={timelineOpen} onOpenChange={setTimelineOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col p-0">
          {selectedTender && (
            <>
              <DialogHeader className="p-4 pb-2 border-b">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base">{selectedTender.tenderName}</DialogTitle>
                    <Badge variant="outline" className="text-[10px] font-mono">{selectedTender.refNo}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${STATUS_COLORS[selectedTender.avenirStatus.toUpperCase()] || ''}`}>{selectedTender.avenirStatus}</Badge>
                  </div>
                  <Button size="sm" onClick={() => { setTimelineOpen(false); openAdd(selectedTender); }}>
                    <Plus className="h-3.5 w-3.5 mr-1" />Add Update
                  </Button>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                  <span>Client: {selectedTender.client}</span>
                  <span>Lead: {selectedTender.lead}</span>
                </div>
              </DialogHeader>
              <div className="flex-1 min-h-0">
                <ProjectUpdateTimeline updates={getUpdatesForTender(selectedTender.id)} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Log Update — {selectedTender?.tenderName}</DialogTitle>
          </DialogHeader>
          {selectedTender && user && (
            <AddUpdateForm
              tenderId={selectedTender.id}
              existingUpdates={getUpdatesForTender(selectedTender.id)}
              onSubmit={handleAddSubmit}
              onCancel={() => setAddOpen(false)}
              userEmail={user.email}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
