import { useState, useMemo } from 'react';
import { Search, Building2, Globe, MapPin, Users, Mail, Phone, User, X, ChevronRight, Plus, Upload, Download, Copy, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useClientStore } from '@/hooks/useClientStore';
import { ClientRecord, ClientContact } from '@/types/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useRef } from 'react';

// ─── Highlight Text ───────────────────────────────────────
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let result = text;
  terms.forEach(term => {
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    result = result.replace(regex, '§$1§');
  });
  const parts = result.split('§');
  return (
    <>
      {parts.map((part, i) => {
        const isMatch = terms.some(t => part.toLowerCase() === t);
        return isMatch ? (
          <mark key={i} className="bg-warning/30 text-foreground rounded px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

// ─── Copy Button ──────────────────────────────────────────
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button onClick={copy} className="inline-flex items-center justify-center h-5 w-5 rounded hover:bg-muted transition-colors">
          {copied ? <Check className="h-3 w-3 text-accent" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">Copy {label}</TooltipContent>
    </Tooltip>
  );
}

// ─── Detail Dialog (like Vendor detail) ───────────────────
function ClientDetailDialog({ client, onClose, searchQuery }: {
  client: ClientRecord | null;
  onClose: () => void;
  searchQuery: string;
}) {
  if (!client) return null;

  return (
    <Dialog open={!!client} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 via-info/5 to-accent/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <HighlightText text={client.name} query={searchQuery} />
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            {client.domain && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                <Globe className="h-3 w-3 mr-1" />{client.domain}
              </Badge>
            )}
            {(client.city || client.country) && (
              <Badge variant="secondary" className="text-xs">
                <MapPin className="h-3 w-3 mr-1" />{[client.city, client.country].filter(Boolean).join(', ')}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              <Users className="h-3 w-3 mr-1" />{client.contacts.length} contact{client.contacts.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 pb-6 space-y-5">
            {/* Location Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5" /> Location
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">City</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {client.city ? <HighlightText text={client.city} query={searchQuery} /> : '—'}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Country</p>
                  <p className="text-sm font-medium text-foreground mt-0.5">
                    {client.country ? <HighlightText text={client.country} query={searchQuery} /> : '—'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contacts */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <Users className="h-3.5 w-3.5" /> Contacts ({client.contacts.length})
              </div>
              {client.contacts.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No contacts added yet.</p>
              ) : (
                <div className="space-y-2">
                  {client.contacts.map((contact) => (
                    <div key={contact.id} className="p-3 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <span className="font-medium text-sm text-foreground">
                            <HighlightText text={`${contact.firstName} ${contact.lastName}`.trim()} query={searchQuery} />
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          {contact.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate max-w-[200px]">
                                <HighlightText text={contact.email} query={searchQuery} />
                              </span>
                              <CopyButton text={contact.email} label="email" />
                            </span>
                          )}
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <HighlightText text={contact.phone} query={searchQuery} />
                              <CopyButton text={contact.phone} label="phone" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

// ─── Client Card (vendor-style 3D) ───────────────────────
function ClientCard({ client, searchQuery, onSelect, matchCount }: {
  client: ClientRecord;
  searchQuery: string;
  onSelect: () => void;
  matchCount: number;
}) {
  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] relative overflow-hidden border-border/60"
      onClick={onSelect}
      style={{ perspective: '1000px' }}
    >
      <div className="h-1 w-full bg-gradient-to-r from-primary via-info to-accent" />

      <CardContent className="p-5 space-y-3">
        {/* Name + Icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
              <HighlightText text={client.name} query={searchQuery} />
            </h3>
            {client.domain && (
              <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <HighlightText text={client.domain} query={searchQuery} />
              </div>
            )}
          </div>
          <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Match badge */}
        {matchCount > 0 && (
          <Badge variant="outline" className="text-[10px] bg-warning/10 text-warning border-warning/30">
            {matchCount} field{matchCount > 1 ? 's' : ''} matched
          </Badge>
        )}

        {/* Location + Domain badges */}
        <div className="flex flex-wrap gap-1.5">
          {(client.city || client.country) && (
            <Badge variant="secondary" className="text-[10px] font-medium">
              <MapPin className="h-3 w-3 mr-0.5" />
              {[client.city, client.country].filter(Boolean).join(', ')}
            </Badge>
          )}
        </div>

        {/* Contact summary */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-info" />
            {client.contacts.length} contact{client.contacts.length !== 1 ? 's' : ''}
          </span>
          {client.contacts[0] && (
            <span className="flex items-center gap-1 ml-auto truncate">
              <Mail className="h-3 w-3" />
              <span className="truncate max-w-[140px]">{client.contacts[0].firstName} {client.contacts[0].lastName}</span>
            </span>
          )}
        </div>

        <div className="flex items-center justify-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity pt-1">
          View full profile <ChevronRight className="h-3 w-3 ml-0.5" />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Add Client Dialog ───────────────────────────────────
function AddClientDialog({ open, onOpenChange, onAdd }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { name: string; city: string; country: string; domain: string; contacts: ClientContact[] }) => void;
}) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [domain, setDomain] = useState('');
  const [contacts, setContacts] = useState<Omit<ClientContact, 'id'>[]>([
    { firstName: '', lastName: '', email: '', phone: '' },
  ]);

  const addRow = () => setContacts([...contacts, { firstName: '', lastName: '', email: '', phone: '' }]);
  const removeRow = (i: number) => setContacts(contacts.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, value: string) => {
    const next = [...contacts];
    (next[i] as any)[field] = value;
    setContacts(next);
  };

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name, city, country, domain,
      contacts: contacts
        .filter((c) => c.firstName || c.email)
        .map((c) => ({ ...c, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2) })),
    });
    setName(''); setCity(''); setCountry(''); setDomain('');
    setContacts([{ firstName: '', lastName: '', email: '', phone: '' }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Company Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dubai" /></div>
            <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="UAE" /></div>
            <div className="sm:col-span-2">
              <Label>Domain / Field</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Engineering, Construction..." />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Contacts</Label>
              <Button variant="ghost" size="sm" onClick={addRow} className="text-xs"><Plus className="h-3 w-3 mr-1" /> Add</Button>
            </div>
            <div className="space-y-3">
              {contacts.map((c, i) => (
                <div key={i} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Contact {i + 1}</span>
                    {contacts.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeRow(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="First Name" value={c.firstName} onChange={(e) => update(i, 'firstName', e.target.value)} className="text-sm" />
                    <Input placeholder="Last Name" value={c.lastName} onChange={(e) => update(i, 'lastName', e.target.value)} className="text-sm" />
                    <Input placeholder="Email" type="email" value={c.email} onChange={(e) => update(i, 'email', e.target.value)} className="text-sm" />
                    <Input placeholder="Phone" value={c.phone} onChange={(e) => update(i, 'phone', e.target.value)} className="text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!name.trim()}>Add Client</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Import Dialog ───────────────────────────────────────
function ImportClientsDialog({ open, onOpenChange, onImport, onGenerateTemplate }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (rows: Record<string, string>[]) => number;
  onGenerateTemplate: () => string[][];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        const count = onImport(rows);
        toast.success(`Imported ${count} client(s)!`);
        onOpenChange(false);
      } catch {
        toast.error('Failed to parse file. Use the template format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const rows = onGenerateTemplate();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'client-import-template.xlsx');
    toast.success('Template downloaded!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Import Clients from Excel</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={downloadTemplate}>
            <Download className="h-4 w-4" /> Download Template (.xlsx)
          </Button>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">Drop your Excel file here</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground">Expected columns:</p>
            <p>Company Name, City, Country, Domain, First Name, Last Name, Email, Phone</p>
            <Separator className="my-1.5" />
            <p className="font-medium text-foreground">Multiple contacts per company:</p>
            <p>Add one row per contact with the <strong>same Company Name</strong>. They'll be merged automatically.</p>
            <div className="mt-2 rounded border border-border overflow-hidden text-[10px]">
              <table className="w-full">
                <thead><tr className="bg-muted">
                  <th className="px-2 py-1 text-left">Company Name</th>
                  <th className="px-2 py-1 text-left">City</th>
                  <th className="px-2 py-1 text-left">First Name</th>
                  <th className="px-2 py-1 text-left">Email</th>
                </tr></thead>
                <tbody>
                  <tr><td className="px-2 py-0.5">Acme Corp</td><td className="px-2 py-0.5">Dubai</td><td className="px-2 py-0.5">John</td><td className="px-2 py-0.5">john@acme.com</td></tr>
                  <tr className="bg-warning/5"><td className="px-2 py-0.5">Acme Corp</td><td className="px-2 py-0.5"></td><td className="px-2 py-0.5">Jane</td><td className="px-2 py-0.5">jane@acme.com</td></tr>
                  <tr><td className="px-2 py-0.5">Beta LLC</td><td className="px-2 py-0.5">Abu Dhabi</td><td className="px-2 py-0.5">Ali</td><td className="px-2 py-0.5">ali@beta.com</td></tr>
                </tbody>
              </table>
            </div>
            <p className="italic mt-1">↑ Acme Corp will have 2 contacts. Case variations are auto-merged.</p>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Match counting ──────────────────────────────────────
function getClientMatchCount(client: ClientRecord, query: string): number {
  if (!query.trim()) return 0;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const fields = [
    client.name, client.city, client.country, client.domain,
    ...client.contacts.flatMap((c) => [c.firstName, c.lastName, c.email, c.phone]),
  ];
  let count = 0;
  fields.forEach((f) => {
    if (terms.some((t) => f.toLowerCase().includes(t))) count++;
  });
  return count;
}

// ─── Quick Tags ──────────────────────────────────────────
function useQuickTags(clients: ClientRecord[]) {
  return useMemo(() => {
    const domainCounts: Record<string, number> = {};
    const countryCounts: Record<string, number> = {};
    clients.forEach((c) => {
      if (c.domain) domainCounts[c.domain] = (domainCounts[c.domain] || 0) + 1;
      if (c.country) countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
    });
    const tags = [
      ...Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k]) => k),
      ...Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => k),
    ];
    return [...new Set(tags)].slice(0, 6);
  }, [clients]);
}

// ─── Main Page ───────────────────────────────────────────
export default function Clients() {
  const { clients, addClient, deleteClient, importFromExcel, generateTemplate } = useClientStore();
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);

  const quickTags = useQuickTags(clients);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter((c) => {
      const fields = [
        c.name, c.city, c.country, c.domain,
        ...c.contacts.flatMap((ct) => [ct.firstName, ct.lastName, ct.email, ct.phone]),
      ];
      return fields.some((f) => f.toLowerCase().includes(q));
    });
  }, [clients, search]);

  const stats = useMemo(() => ({
    total: clients.length,
    withContacts: clients.filter((c) => c.contacts.length > 0).length,
    totalContacts: clients.reduce((s, c) => s + c.contacts.length, 0),
    domains: new Set(clients.map((c) => c.domain).filter(Boolean)).size,
  }), [clients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" /> Client Directory
          </h1>
          <p className="text-muted-foreground text-sm">Search anything — name, city, domain, contacts, email, phone</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Import</span>
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Add Client</span>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Clients', value: stats.total, color: 'primary' },
          { label: 'With Contacts', value: stats.withContacts, color: 'info' },
          { label: 'Total Contacts', value: stats.totalContacts, color: 'success' },
          { label: 'Domains', value: stats.domains, color: 'warning' },
        ].map((s) => (
          <Card key={s.label} className="transition-all hover:shadow-lg hover:-translate-y-0.5">
            <CardContent className="pt-4 pb-3 text-center">
              <p className={`text-2xl font-bold text-${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name, city, domain, contact, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 text-base"
          />
          {search && (
            <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearch('')}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Quick Tags */}
      {quickTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quickTags.map((tag) => (
            <Badge
              key={tag}
              variant={search === tag ? 'default' : 'secondary'}
              className="cursor-pointer text-xs hover:bg-primary/20"
              onClick={() => setSearch(search === tag ? '' : tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {filteredClients.length} of {clients.length} clients
        {search && <span> matching "<strong>{search}</strong>"</span>}
      </p>

      {/* Cards Grid */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold text-foreground">
            {clients.length === 0 ? 'No clients yet' : 'No matches found'}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            {clients.length === 0 ? 'Add your first client manually or import from Excel.' : 'Try adjusting your search terms.'}
          </p>
          {clients.length === 0 && (
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="h-4 w-4 mr-1" /> Import
              </Button>
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Client
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              searchQuery={search}
              onSelect={() => setSelectedClient(client)}
              matchCount={search ? getClientMatchCount(client, search) : 0}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ClientDetailDialog client={selectedClient} onClose={() => setSelectedClient(null)} searchQuery={search} />
      <AddClientDialog open={addOpen} onOpenChange={setAddOpen} onAdd={addClient} />
      <ImportClientsDialog open={importOpen} onOpenChange={setImportOpen} onImport={importFromExcel} onGenerateTemplate={generateTemplate} />
    </div>
  );
}
