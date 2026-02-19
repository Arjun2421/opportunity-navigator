import { useState, useMemo } from 'react';
import { Search, Building2, Globe, Shield, Users, Mail, ExternalLink, Award, Cpu, Briefcase, FlaskConical, Handshake, X, ChevronRight, FileText, Phone, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getVendors, searchVendors, VendorData } from '@/data/vendorData';

const AGREEMENT_COLORS: Record<string, string> = {
  'NDA': 'bg-info/15 text-info border-info/30',
  'Association Agreement': 'bg-success/15 text-success border-success/30',
  'Pending': 'bg-warning/15 text-warning border-warning/30',
};

const FOCUS_ICONS: Record<string, typeof Cpu> = {
  'Cybersecurity': Shield,
  'AI': Cpu,
  'IT': Layers,
};

function getFocusIcon(focus: string) {
  for (const [key, Icon] of Object.entries(FOCUS_ICONS)) {
    if (focus.toLowerCase().includes(key.toLowerCase())) return Icon;
  }
  return Briefcase;
}

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

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVendor, setSelectedVendor] = useState<VendorData | null>(null);

  const allVendors = useMemo(() => getVendors(), []);

  const filteredVendors = useMemo(() => {
    let result = searchVendors(allVendors, searchQuery);
    if (filterStatus !== 'all') {
      result = result.filter(v => v.agreementStatus === filterStatus);
    }
    return result;
  }, [allVendors, searchQuery, filterStatus]);

  const stats = useMemo(() => ({
    total: allVendors.length,
    nda: allVendors.filter(v => v.agreementStatus === 'NDA').length,
    association: allVendors.filter(v => v.agreementStatus === 'Association Agreement').length,
    pending: allVendors.filter(v => v.agreementStatus === 'Pending').length,
  }), [allVendors]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Vendor Directory
        </h1>
        <p className="text-muted-foreground text-sm">Search anything — tech stack, certifications, industries, partners, contacts, projects</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Vendors', value: stats.total, color: 'primary', status: 'all' },
          { label: 'NDA Signed', value: stats.nda, color: 'info', status: 'NDA' },
          { label: 'Association', value: stats.association, color: 'success', status: 'Association Agreement' },
          { label: 'Pending', value: stats.pending, color: 'warning', status: 'Pending' },
        ].map(s => (
          <Card
            key={s.status}
            className={`cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${filterStatus === s.status ? `ring-2 ring-${s.color}/50 shadow-lg` : ''}`}
            onClick={() => setFilterStatus(filterStatus === s.status ? 'all' : s.status)}
          >
            <CardContent className="pt-4 pb-3 text-center">
              <p className={`text-2xl font-bold text-${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by tech stack, certification, industry, service, partner, contact, project..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 text-base"
        />
        {searchQuery && (
          <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2" onClick={() => setSearchQuery('')}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter + count */}
      <div className="flex items-center gap-3 flex-wrap">
        {filterStatus !== 'all' && (
          <Badge variant="secondary" className="gap-1">
            {filterStatus}
            <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus('all')} />
          </Badge>
        )}
        <p className="text-sm text-muted-foreground">
          {filteredVendors.length} of {allVendors.length} vendors
          {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
        </p>
      </div>

      {/* 3D Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            searchQuery={searchQuery}
            onSelect={() => setSelectedVendor(vendor)}
          />
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No vendors found matching your search criteria.
          </CardContent>
        </Card>
      )}

      {/* Vendor Detail Dialog */}
      <VendorDetailDialog
        vendor={selectedVendor}
        onClose={() => setSelectedVendor(null)}
        searchQuery={searchQuery}
      />
    </div>
  );
}

function VendorCard({ vendor, searchQuery, onSelect }: {
  vendor: VendorData;
  searchQuery: string;
  onSelect: () => void;
}) {
  const agreementColor = AGREEMENT_COLORS[vendor.agreementStatus] || 'bg-muted text-muted-foreground';
  const FocusIcon = getFocusIcon(vendor.focusArea);

  return (
    <Card
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.01] relative overflow-hidden border-border/60"
      onClick={onSelect}
      style={{ perspective: '1000px' }}
    >
      {/* Gradient accent top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-info to-accent" />

      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
              <HighlightText text={vendor.companyName} query={searchQuery} />
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{vendor.companySize}</span>
            </div>
          </div>
          <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <FocusIcon className="h-5 w-5 text-primary" />
          </div>
        </div>

        {/* Focus + Agreement badges */}
        <div className="flex flex-wrap gap-1.5">
          {vendor.focusArea && (
            <Badge variant="secondary" className="text-[10px] font-medium">
              {vendor.focusArea}
            </Badge>
          )}
          {vendor.agreementStatus && (
            <Badge variant="outline" className={`text-[10px] ${agreementColor}`}>
              {vendor.agreementStatus}
            </Badge>
          )}
        </div>

        {/* Tech stack preview */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Cpu className="h-3 w-3" /> Tech Stack
          </p>
          <div className="flex flex-wrap gap-1">
            {vendor.confirmedTechStack.slice(0, 6).map((tech, i) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/8 text-primary border border-primary/15">
                <HighlightText text={tech} query={searchQuery} />
              </span>
            ))}
            {vendor.confirmedTechStack.length > 6 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] text-muted-foreground bg-muted">
                +{vendor.confirmedTechStack.length - 6}
              </span>
            )}
          </div>
        </div>

        {/* Industries preview */}
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Globe className="h-3 w-3" /> Industries
          </p>
          <div className="flex flex-wrap gap-1">
            {vendor.primaryIndustries.slice(0, 3).map((ind, i) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-info/8 text-info border border-info/15">
                <HighlightText text={ind} query={searchQuery} />
              </span>
            ))}
            {vendor.primaryIndustries.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] text-muted-foreground bg-muted">
                +{vendor.primaryIndustries.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Certifications + Partners row */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 border-t border-border/50">
          {vendor.certifications.length > 0 && (
            <span className="flex items-center gap-1">
              <Award className="h-3 w-3 text-warning" />
              {vendor.certifications.length} cert{vendor.certifications.length > 1 ? 's' : ''}
            </span>
          )}
          {vendor.partners.length > 0 && (
            <span className="flex items-center gap-1">
              <Handshake className="h-3 w-3 text-accent" />
              {vendor.partners.length} partner{vendor.partners.length > 1 ? 's' : ''}
            </span>
          )}
          {vendor.contactPerson && (
            <span className="flex items-center gap-1 ml-auto">
              <Mail className="h-3 w-3" />
              {vendor.contactPerson}
            </span>
          )}
        </div>

        {/* View more indicator */}
        <div className="flex items-center justify-center text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity pt-1">
          View full profile <ChevronRight className="h-3 w-3 ml-0.5" />
        </div>
      </CardContent>
    </Card>
  );
}

function DetailSection({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      {children}
    </div>
  );
}

function TagGrid({ items, color, query }: { items: string[]; color: string; query: string }) {
  if (!items.length) return <p className="text-xs text-muted-foreground italic">None listed</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${color}`}>
          <HighlightText text={item} query={query} />
        </span>
      ))}
    </div>
  );
}

function VendorDetailDialog({ vendor, onClose, searchQuery }: {
  vendor: VendorData | null;
  onClose: () => void;
  searchQuery: string;
}) {
  if (!vendor) return null;

  return (
    <Dialog open={!!vendor} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/5 via-info/5 to-accent/5">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {vendor.companyName}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="h-3 w-3 mr-1" />
              {vendor.companySize}
            </Badge>
            {vendor.focusArea && (
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                {vendor.focusArea}
              </Badge>
            )}
            {vendor.agreementStatus && (
              <Badge variant="outline" className={`text-xs ${AGREEMENT_COLORS[vendor.agreementStatus] || ''}`}>
                {vendor.agreementStatus}
              </Badge>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 pb-6 space-y-5">
            {/* Tech Stack */}
            <DetailSection icon={Cpu} label="Confirmed Tech Stack">
              <TagGrid items={vendor.confirmedTechStack} color="bg-primary/8 text-primary border-primary/15" query={searchQuery} />
            </DetailSection>

            {/* Services */}
            <DetailSection icon={Briefcase} label="Services">
              <TagGrid items={vendor.confirmedServices} color="bg-success/8 text-success border-success/15" query={searchQuery} />
            </DetailSection>

            {/* Industries */}
            <DetailSection icon={Globe} label="Industries">
              <TagGrid items={vendor.primaryIndustries} color="bg-info/8 text-info border-info/15" query={searchQuery} />
            </DetailSection>

            {/* Certifications */}
            <DetailSection icon={Award} label="Certifications">
              <TagGrid items={vendor.certifications} color="bg-warning/8 text-warning border-warning/15" query={searchQuery} />
            </DetailSection>

            {/* Partners */}
            <DetailSection icon={Handshake} label="Partners">
              <TagGrid items={vendor.partners} color="bg-accent/8 text-accent border-accent/15" query={searchQuery} />
            </DetailSection>

            {/* Sample Projects */}
            <DetailSection icon={FlaskConical} label="Sample Projects">
              <TagGrid items={vendor.sampleProjects} color="bg-muted border-border" query={searchQuery} />
            </DetailSection>

            {/* Not Specialized */}
            {vendor.nonSpecializedTechStack.length > 0 && (
              <DetailSection icon={X} label="Not Specialized In">
                <TagGrid items={vendor.nonSpecializedTechStack} color="bg-destructive/5 text-destructive border-destructive/15" query={searchQuery} />
              </DetailSection>
            )}

            <Separator />

            {/* Contact & Agreement */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Contact
                </p>
                <p className="font-medium">{vendor.contactPerson || '—'}</p>
                {vendor.emails.map((email, i) => (
                  <a key={i} href={`mailto:${email}`} className="text-primary hover:underline block text-xs truncate mt-0.5">
                    {email}
                  </a>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <FileText className="h-3 w-3" /> Agreement
                </p>
                <p className="font-medium">{vendor.agreementStatus || '—'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Docs: {vendor.agreementDocuments || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> Sources
                </p>
                {vendor.sources.map((src, i) => (
                  src.startsWith('http') ? (
                    <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1 truncate mt-0.5">
                      <ExternalLink className="h-3 w-3 shrink-0" /> {src.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  ) : (
                    <span key={i} className="text-xs text-muted-foreground block mt-0.5">{src}</span>
                  )
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
