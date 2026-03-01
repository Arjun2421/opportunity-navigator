import { useState, useMemo, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import {
  getTenderUpdates,
  getUpdatesForOpportunity,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Plus, FileText, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table as DocxTable, TableRow as DocxRow, TableCell as DocxCell, WidthType, BorderStyle } from 'docx';

export default function TenderUpdates() {
  const { tenders } = useData();
  const { user, isMaster, isAdmin, isProposalHead } = useAuth();
  const canEdit = isMaster || isAdmin || isProposalHead;

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [leadFilter, setLeadFilter] = useState('all');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const allUpdates = useMemo(() => getTenderUpdates(), [refreshKey]);

  // Map seed opportunity IDs to real tenders if possible
  const effectiveTenders = useMemo(() => {
    const mapped = tenders.map(t => t);
    // If there are seed updates referencing seed-op-1, seed-op-2 and real tenders exist, map them
    if (tenders.length >= 2) {
      const seedMap: Record<string, string> = {
        'seed-op-1': tenders[0]?.id,
        'seed-op-2': tenders[1]?.id,
      };
      // Remap update opportunityIds in memory
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

  // Excel export
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();
    const exportTenders = selectedIds.size > 0 ? filteredTenders.filter(t => selectedIds.has(t.id)) : filteredTenders;

    const oppData = exportTenders.map(t => ({
      Group: t.groupClassification,
      'Tender Name': t.tenderName,
      'Ref No': t.refNo,
      Lead: t.lead,
      Status: t.avenirStatus,
      Client: t.client,
    }));
    const ws1 = XLSX.utils.json_to_sheet(oppData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Opportunities');

    exportTenders.forEach(t => {
      const tUpdates = allUpdates.filter(u => u.opportunityId === t.id);
      if (tUpdates.length === 0) return;
      const uData = tUpdates.map(u => ({
        Type: u.type,
        SubType: u.subType,
        Actor: u.actor,
        Date: format(new Date(u.date), 'dd MMM yyyy'),
        'Due Date': u.dueDate ? format(new Date(u.dueDate), 'dd MMM yyyy') : '',
        Details: u.details,
        'Created By': u.createdBy,
      }));
      const ws = XLSX.utils.json_to_sheet(uData);
      const sheetName = (t.refNo || t.tenderName).substring(0, 28);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `TenderUpdates_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);
    toast.success('Excel exported successfully');
  };

  // Word export
  const exportWord = async () => {
    const exportTenders = selectedIds.size > 0 ? filteredTenders.filter(t => selectedIds.has(t.id)) : filteredTenders;

    const sections: any[] = [];

    // Cover page
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
          new DocxRow({
            children: ['Type', 'Sub-Type', 'Actor', 'Date', 'Due Date', 'Details'].map(h =>
              new DocxCell({
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })],
                width: { size: 1500, type: WidthType.DXA },
              })
            ),
          }),
          ...tUpdates.map(u =>
            new DocxRow({
              children: [
                u.type, u.subType, u.actor,
                format(new Date(u.date), 'dd MMM yyyy'),
                u.dueDate ? format(new Date(u.dueDate), 'dd MMM yyyy') : '-',
                u.details.substring(0, 60),
              ].map(cell =>
                new DocxCell({
                  children: [new Paragraph({ children: [new TextRun({ text: cell, size: 16 })] })],
                  width: { size: 1500, type: WidthType.DXA },
                })
              ),
            })
          ),
        ];

        sections.push(
          new DocxTable({ rows, width: { size: 9000, type: WidthType.DXA } }),
          new Paragraph({ text: '' }),
        );
      } else {
        sections.push(new Paragraph({ children: [new TextRun({ text: 'No updates recorded.', italics: true, size: 18, color: '999999' })] }));
      }
    });

    const doc = new Document({
      sections: [{ children: sections }],
    });

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
    return (
      <Badge className={colors[due.status]} variant="secondary">
        {format(new Date(due.date), 'dd MMM')}
      </Badge>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 h-full">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Tender Updates</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <InteractiveGraph tenders={filteredTenders} updates={allUpdates} onSelectTender={setSelectedTenderId} />
          <MermaidPreview tenders={filteredTenders} updates={allUpdates} />
          <Button variant="outline" size="sm" onClick={exportExcel}>
            <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={exportWord}>
            <FileText className="h-4 w-4 mr-1" /> Word
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <Input className="w-56" placeholder="Search tender / ref..." value={search} onChange={e => setSearch(e.target.value)} />
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Group" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={leadFilter} onValueChange={setLeadFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Lead" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leads</SelectItem>
            {leads.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch id="upcoming" checked={upcomingOnly} onCheckedChange={setUpcomingOnly} />
          <Label htmlFor="upcoming" className="text-xs">Upcoming Only</Label>
        </div>
      </div>

      {/* Due Dates Widget */}
      <DueDatesWidget tenders={effectiveTenders} onSelectTender={setSelectedTenderId} />

      {/* Split Pane */}
      <div className="border rounded-lg" style={{ height: 'calc(100vh - 380px)' }}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead>Tender Name</TableHead>
                    <TableHead>Ref No</TableHead>
                    <TableHead>Lead</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenders.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">No tenders found.</TableCell></TableRow>
                  )}
                  {filteredTenders.map(t => (
                    <TableRow
                      key={t.id}
                      className={`cursor-pointer transition-colors ${selectedTenderId === t.id ? 'bg-accent/20' : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedTenderId(t.id)}
                    >
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Checkbox checked={selectedIds.has(t.id)} onCheckedChange={() => toggleSelect(t.id)} />
                      </TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px] font-mono">{t.groupClassification}</Badge></TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{t.tenderName}</TableCell>
                      <TableCell className="font-mono text-xs">{t.refNo}</TableCell>
                      <TableCell className="text-xs">{t.lead}</TableCell>
                      <TableCell>{getDuePill(t.id)}</TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px]">{t.avenirStatus}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={55} minSize={30}>
            <div className="h-full overflow-auto p-4">
              {selectedTender ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{selectedTender.tenderName}</h3>
                    {canEdit && (
                      <Button size="sm" onClick={() => setAddModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-1" /> Add Update
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
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Select a tender to view its timeline.</p>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Add Update Modal */}
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
