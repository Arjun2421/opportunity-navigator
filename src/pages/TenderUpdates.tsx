import { useState, useMemo, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  getTenderUpdates,
  deleteTenderUpdate,
  getNextDueDate,
  TenderUpdate,
} from '@/data/tenderUpdatesData';
import { UpdateTimeline } from '@/components/TenderUpdates/UpdateTimeline';
import { AddUpdateModal } from '@/components/TenderUpdates/AddUpdateModal';
import { DueDatesWidget } from '@/components/TenderUpdates/DueDatesWidget';
import { InteractiveGraph } from '@/components/TenderUpdates/InteractiveGraph';
import { MermaidPreview } from '@/components/TenderUpdates/MermaidPreview';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, Plus, FileText, FileSpreadsheet, Search, GitBranch, Filter, X, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table as DocxTable, TableRow as DocxRow, TableCell as DocxCell, WidthType } from 'docx';
import { useIsMobile } from '@/hooks/use-mobile';

export default function TenderUpdates() {
  const { tenders } = useData();
  const { user, isMaster, isAdmin, isProposalHead } = useAuth();
  const canEdit = isMaster || isAdmin || isProposalHead;
  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leadFilter, setLeadFilter] = useState('all');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const allUpdates = useMemo(() => getTenderUpdates(), [refreshKey]);

  const effectiveTenders = useMemo(() => {
    const mapped = tenders.map(t => t);
    if (tenders.length >= 2) {
      const seedMap: Record<string, string> = {
        'seed-op-1': tenders[0]?.id,
        'seed-op-2': tenders[1]?.id,
      };
      allUpdates.forEach(u => {
        if (seedMap[u.opportunityId]) {
          u.opportunityId = seedMap[u.opportunityId];
        }
      });
    }
    return mapped;
  }, [tenders, allUpdates]);

  const groups = useMemo(() => [...new Set(effectiveTenders.map(t => t.groupClassification).filter(Boolean))], [effectiveTenders]);
  const leads = useMemo(() => [...new Set(effectiveTenders.map(t => t.lead).filter(Boolean))], [effectiveTenders]);
  const statuses = useMemo(() => [...new Set(effectiveTenders.map(t => t.avenirStatus).filter(Boolean))], [effectiveTenders]);

  const filteredTenders = useMemo(() => {
    return effectiveTenders.filter(t => {
      if (search) {
        const q = search.toLowerCase();
        if (!t.tenderName.toLowerCase().includes(q) && !t.refNo.toLowerCase().includes(q)) return false;
      }
      if (groupFilter !== 'all' && t.groupClassification !== groupFilter) return false;
      if (statusFilter !== 'all' && t.avenirStatus !== statusFilter) return false;
      if (leadFilter !== 'all' && t.lead !== leadFilter) return false;
      if (upcomingOnly) {
        const due = getNextDueDate(t.id);
        if (!due || due.status === 'safe') return false;
      }
      return true;
    });
  }, [effectiveTenders, search, groupFilter, statusFilter, leadFilter, upcomingOnly]);

  const selectedTender = effectiveTenders.find(t => t.id === selectedTenderId);
  const selectedUpdates = selectedTenderId ? allUpdates.filter(u => u.opportunityId === selectedTenderId) : [];

  const handleRefresh = useCallback(() => setRefreshKey(k => k + 1), []);
  const handleDelete = useCallback((id: string) => { deleteTenderUpdate(id); handleRefresh(); }, [handleRefresh]);
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const activeFilterCount = [groupFilter !== 'all', statusFilter !== 'all', leadFilter !== 'all', upcomingOnly].filter(Boolean).length;

  // Excel export
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const exportTenders = selectedIds.size > 0 ? filteredTenders.filter(t => selectedIds.has(t.id)) : filteredTenders;
    const oppData = exportTenders.map(t => ({ Group: t.groupClassification, 'Tender Name': t.tenderName, 'Ref No': t.refNo, Lead: t.lead, Status: t.avenirStatus, Client: t.client }));
    const ws1 = XLSX.utils.json_to_sheet(oppData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Opportunities');
    exportTenders.forEach(t => {
      const tUpdates = allUpdates.filter(u => u.opportunityId === t.id);
      if (tUpdates.length === 0) return;
      const uData = tUpdates.map(u => ({ Type: u.type, SubType: u.subType, Actor: u.actor, Date: format(new Date(u.date), 'dd MMM yyyy'), 'Due Date': u.dueDate ? format(new Date(u.dueDate), 'dd MMM yyyy') : '', Details: u.details, 'Created By': u.createdBy }));
      const ws = XLSX.utils.json_to_sheet(uData);
      XLSX.utils.book_append_sheet(wb, ws, (t.refNo || t.tenderName).substring(0, 28));
    });
    XLSX.writeFile(wb, `TenderUpdates_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    toast.success('Excel exported successfully');
  };

  // Word export
  const exportWord = async () => {
    const exportTenders = selectedIds.size > 0 ? filteredTenders.filter(t => selectedIds.has(t.id)) : filteredTenders;
    const sections: any[] = [];
    sections.push(
      new Paragraph({ text: 'Tender Updates Report', heading: HeadingLevel.TITLE, spacing: { after: 400 } }),
      new Paragraph({ children: [new TextRun({ text: `Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, size: 20, color: '666666' })] }),
      new Paragraph({ children: [new TextRun({ text: `Total Tenders: ${exportTenders.length}`, size: 20, color: '666666' })] }),
      new Paragraph({ text: '' }),
    );
    exportTenders.forEach(t => {
      const tUpdates = allUpdates.filter(u => u.opportunityId === t.id);
      sections.push(
        new Paragraph({ text: `${t.tenderName} — ${t.refNo}`, heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
        new Paragraph({ children: [new TextRun({ text: `Group: ${t.groupClassification} | Lead: ${t.lead} | Status: ${t.avenirStatus}`, size: 18, color: '888888' })] }),
      );
      if (tUpdates.length > 0) {
        const rows = [
          new DocxRow({ children: ['Type', 'Sub-Type', 'Actor', 'Date', 'Due Date', 'Details'].map(h => new DocxCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })], width: { size: 1500, type: WidthType.DXA } })) }),
          ...tUpdates.map(u => new DocxRow({ children: [u.type, u.subType, u.actor, format(new Date(u.date), 'dd MMM yyyy'), u.dueDate ? format(new Date(u.dueDate), 'dd MMM yyyy') : '-', u.details.substring(0, 60)].map(cell => new DocxCell({ children: [new Paragraph({ children: [new TextRun({ text: cell, size: 16 })] })], width: { size: 1500, type: WidthType.DXA } })) })),
        ];
        sections.push(new DocxTable({ rows, width: { size: 9000, type: WidthType.DXA } }), new Paragraph({ text: '' }));
      } else {
        sections.push(new Paragraph({ children: [new TextRun({ text: 'No updates recorded.', italics: true, size: 18, color: '999999' })] }));
      }
    });
    const doc = new Document({ sections: [{ children: sections }] });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TenderUpdates_${format(new Date(), 'yyyyMMdd_HHmm')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Word document exported successfully');
  };

  const getDuePill = (tenderId: string) => {
    const due = getNextDueDate(tenderId);
    if (!due) return null;
    const colors: Record<string, string> = {
      overdue: 'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]',
      urgent: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
      upcoming: 'bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]',
      safe: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
    };
    return <Badge className={colors[due.status]} variant="secondary">{format(new Date(due.date), 'dd MMM')}</Badge>;
  };

  const getUpdateCount = (tenderId: string) => allUpdates.filter(u => u.opportunityId === tenderId).length;

  return (
    <div className="p-3 md:p-5 space-y-3 h-full">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
            <GitBranch className="h-5 w-5 text-[hsl(var(--primary-foreground))]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Tender Updates</h1>
            <p className="text-xs text-muted-foreground">{filteredTenders.length} tenders • {allUpdates.length} updates</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <InteractiveGraph tender={selectedTender || null} updates={allUpdates} onSelectTender={setSelectedTenderId} />
          <MermaidPreview tenders={filteredTenders} updates={allUpdates} />
          <Button variant="outline" size="sm" onClick={exportExcel} className="h-8">
            <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> <span className="hidden sm:inline">Excel</span>
          </Button>
          <Button variant="outline" size="sm" onClick={exportWord} className="h-8">
            <FileText className="h-3.5 w-3.5 mr-1" /> <span className="hidden sm:inline">Word</span>
          </Button>
        </div>
      </div>

      {/* Search & Filter Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-0 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="h-9 pl-8 text-sm bg-card/50"
            placeholder="Search tenders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="absolute right-2.5 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          className="h-9 gap-1.5"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 w-5 h-5 rounded-full bg-[hsl(var(--primary-foreground))] text-[hsl(var(--primary))] text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <Switch id="upcoming" checked={upcomingOnly} onCheckedChange={setUpcomingOnly} />
          <Label htmlFor="upcoming" className="text-xs cursor-pointer">Urgent only</Label>
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <div className="flex items-center gap-2 flex-wrap p-3 rounded-lg bg-muted/30 border border-border/50 animate-fade-in">
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="w-full sm:w-36 h-8 text-xs"><SelectValue placeholder="Group" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-36 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={leadFilter} onValueChange={setLeadFilter}>
            <SelectTrigger className="w-full sm:w-36 h-8 text-xs"><SelectValue placeholder="Lead" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              {leads.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => { setGroupFilter('all'); setStatusFilter('all'); setLeadFilter('all'); setUpcomingOnly(false); }}>
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
      )}

      {/* Due Dates Widget */}
      <DueDatesWidget tenders={effectiveTenders} onSelectTender={setSelectedTenderId} />

      {/* Split Pane */}
      <div className="rounded-xl border bg-card/30 backdrop-blur-sm overflow-hidden" style={{ height: 'calc(100vh - 340px)' }}>
        <ResizablePanelGroup direction={isMobile ? 'vertical' : 'horizontal'}>
          <ResizablePanel defaultSize={isMobile ? 40 : 42} minSize={25}>
            <div className="h-full overflow-auto scrollbar-thin">
              {/* Mini header */}
              <div className="sticky top-0 z-10 bg-card/90 backdrop-blur-sm border-b px-3 py-2 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Tenders ({filteredTenders.length})</span>
                {selectedIds.size > 0 && (
                  <Badge variant="secondary" className="text-[10px]">{selectedIds.size} selected</Badge>
                )}
              </div>
              <div className="divide-y divide-border/50">
                {filteredTenders.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No tenders match your filters.</div>
                )}
                {filteredTenders.map(t => {
                  const isSelected = selectedTenderId === t.id;
                  const updateCount = getUpdateCount(t.id);
                  return (
                    <div
                      key={t.id}
                      className={`relative px-3 py-2.5 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary/8 border-l-[3px] border-l-[hsl(var(--primary))]'
                          : 'hover:bg-muted/40 border-l-[3px] border-l-transparent'
                      }`}
                      onClick={() => setSelectedTenderId(t.id)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="pt-0.5" onClick={e => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(t.id)}
                            onCheckedChange={() => toggleSelect(t.id)}
                            className="h-3.5 w-3.5"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate flex-1">{t.tenderName}</span>
                            {getDuePill(t.id)}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono text-muted-foreground">{t.refNo}</span>
                            <Badge variant="outline" className="text-[9px] h-4 px-1">{t.groupClassification}</Badge>
                            {updateCount > 0 && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Activity className="h-2.5 w-2.5" /> {updateCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                            <span>{t.lead}</span>
                            <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{t.avenirStatus}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={isMobile ? 60 : 58} minSize={30}>
            <div className="h-full overflow-auto scrollbar-thin">
              {selectedTender ? (
                <div className="p-4 space-y-4">
                  {/* Selected tender header */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/50">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base truncate">{selectedTender.tenderName}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {selectedTender.refNo} • {selectedTender.groupClassification} • {selectedTender.lead}
                      </p>
                    </div>
                    {canEdit && (
                      <Button size="sm" onClick={() => setAddModalOpen(true)} className="shrink-0 gap-1.5" style={{ background: 'var(--gradient-hero)' }}>
                        <Plus className="h-3.5 w-3.5" /> Add Update
                      </Button>
                    )}
                  </div>
                  <UpdateTimeline
                    updates={selectedUpdates}
                    tenderName={selectedTender.tenderName}
                    canEdit={canEdit}
                    onDelete={handleDelete}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-muted/30 flex items-center justify-center">
                    <GitBranch className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Select a tender</p>
                    <p className="text-xs mt-1">Click any tender from the list to view its timeline</p>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {selectedTender && (
        <AddUpdateModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          opportunityId={selectedTender.id}
          tenderName={selectedTender.tenderName}
          onAdded={handleRefresh}
        />
      )}
    </div>
  );
}
