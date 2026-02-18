import { useState, useMemo } from 'react';
import { Search, Building2, Globe, Shield, Users, Mail, ChevronDown, ChevronUp, ExternalLink, Award, Cpu, Briefcase, FlaskConical, Handshake, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getVendors, searchVendors, VendorData } from '@/data/vendorData';

const AGREEMENT_COLORS: Record<string, string> = {
  'NDA': 'bg-info/10 text-info border-info/30',
  'Association Agreement': 'bg-success/10 text-success border-success/30',
  'Pending': 'bg-warning/10 text-warning border-warning/30',
};

const FOCUS_COLORS = [
  'bg-primary/10 text-primary',
  'bg-accent/10 text-accent',
  'bg-info/10 text-info',
  'bg-warning/10 text-warning',
  'bg-pending/10 text-[hsl(var(--pending))]',
];

export default function Vendors() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const allVendors = useMemo(() => getVendors(), []);
  
  const filteredVendors = useMemo(() => {
    let result = searchVendors(allVendors, searchQuery);
    if (filterStatus !== 'all') {
      result = result.filter(v => v.agreementStatus === filterStatus);
    }
    return result;
  }, [allVendors, searchQuery, filterStatus]);

  const statuses = useMemo(() => {
    const s = [...new Set(allVendors.map(v => v.agreementStatus).filter(Boolean))];
    return s;
  }, [allVendors]);

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
        <p className="text-muted-foreground">Search across tech stacks, certifications, industries, and more</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all" onClick={() => setFilterStatus('all')}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Vendors</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:ring-2 hover:ring-info/30 transition-all" onClick={() => setFilterStatus(filterStatus === 'NDA' ? 'all' : 'NDA')}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-info">{stats.nda}</p>
            <p className="text-xs text-muted-foreground">NDA Signed</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:ring-2 hover:ring-success/30 transition-all" onClick={() => setFilterStatus(filterStatus === 'Association Agreement' ? 'all' : 'Association Agreement')}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-success">{stats.association}</p>
            <p className="text-xs text-muted-foreground">Association</p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:ring-2 hover:ring-warning/30 transition-all" onClick={() => setFilterStatus(filterStatus === 'Pending' ? 'all' : 'Pending')}>
          <CardContent className="pt-4 pb-3 text-center">
            <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by tech stack, certification, industry, service, partner, contact..."
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

      {/* Filter chips */}
      {filterStatus !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtering:</span>
          <Badge variant="secondary" className="gap-1">
            {filterStatus}
            <X className="h-3 w-3 cursor-pointer" onClick={() => setFilterStatus('all')} />
          </Badge>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredVendors.length} of {allVendors.length} vendors
        {searchQuery && <span> matching "<strong>{searchQuery}</strong>"</span>}
      </p>

      {/* Vendor Cards */}
      <div className="space-y-3">
        {filteredVendors.map((vendor, idx) => (
          <VendorCard
            key={vendor.id}
            vendor={vendor}
            index={idx}
            isExpanded={expandedId === vendor.id}
            onToggle={() => setExpandedId(expandedId === vendor.id ? null : vendor.id)}
            searchQuery={searchQuery}
          />
        ))}
        {filteredVendors.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No vendors found matching your search criteria.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  let result = text;
  // Simple highlight - wrap matched terms
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

function TagList({ items, icon: Icon, label, color, query, max = 6 }: {
  items: string[];
  icon: any;
  label: string;
  color: string;
  query: string;
  max?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  if (!items.length) return null;
  const display = showAll ? items : items.slice(0, max);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {display.map((item, i) => (
          <Badge key={i} variant="outline" className={`text-xs font-normal ${color}`}>
            <HighlightText text={item} query={query} />
          </Badge>
        ))}
        {items.length > max && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowAll(!showAll); }}
            className="text-xs text-primary hover:underline"
          >
            {showAll ? 'Show less' : `+${items.length - max} more`}
          </button>
        )}
      </div>
    </div>
  );
}

function VendorCard({ vendor, index, isExpanded, onToggle, searchQuery }: {
  vendor: VendorData;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const agreementColor = AGREEMENT_COLORS[vendor.agreementStatus] || 'bg-muted text-muted-foreground';
  const focusColor = FOCUS_COLORS[index % FOCUS_COLORS.length];

  return (
    <Card className={`transition-all hover:shadow-md ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}>
      {/* Collapsed Header */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base">
                <HighlightText text={vendor.companyName} query={searchQuery} />
              </h3>
              {vendor.agreementStatus && (
                <Badge variant="outline" className={`text-xs ${agreementColor}`}>
                  {vendor.agreementStatus}
                </Badge>
              )}
              {vendor.focusArea && (
                <Badge variant="secondary" className={`text-xs ${focusColor}`}>
                  {vendor.focusArea}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {vendor.companySize}
              </span>
              {vendor.contactPerson && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {vendor.contactPerson}
                </span>
              )}
              {vendor.certifications.length > 0 && (
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  {vendor.certifications.length} cert{vendor.certifications.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {/* Quick tech preview */}
            <div className="flex flex-wrap gap-1 mt-2">
              {vendor.confirmedTechStack.slice(0, 5).map((tech, i) => (
                <Badge key={i} variant="outline" className="text-[10px] font-normal bg-primary/5 text-primary border-primary/20">
                  <HighlightText text={tech} query={searchQuery} />
                </Badge>
              ))}
              {vendor.confirmedTechStack.length > 5 && (
                <span className="text-[10px] text-muted-foreground self-center">+{vendor.confirmedTechStack.length - 5}</span>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <>
          <Separator />
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TagList items={vendor.primaryIndustries} icon={Globe} label="Industries" color="bg-info/5 border-info/20 text-info" query={searchQuery} max={8} />
              <TagList items={vendor.confirmedServices} icon={Briefcase} label="Services" color="bg-success/5 border-success/20 text-success" query={searchQuery} max={8} />
              <TagList items={vendor.confirmedTechStack} icon={Cpu} label="Tech Stack" color="bg-primary/5 border-primary/20 text-primary" query={searchQuery} max={12} />
              <TagList items={vendor.certifications} icon={Award} label="Certifications" color="bg-warning/5 border-warning/20 text-warning" query={searchQuery} />
              <TagList items={vendor.partners} icon={Handshake} label="Partners" color="bg-pending/5 border-[hsl(var(--pending))]/20 text-[hsl(var(--pending))]" query={searchQuery} />
              <TagList items={vendor.sampleProjects} icon={FlaskConical} label="Sample Projects" color="bg-muted" query={searchQuery} max={4} />
            </div>

            {/* Contact & Agreement Section */}
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Contact</p>
                <p className="font-medium">{vendor.contactPerson || '—'}</p>
                {vendor.emails.map((email, i) => (
                  <a key={i} href={`mailto:${email}`} className="text-primary hover:underline block text-xs truncate">
                    {email}
                  </a>
                ))}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Agreement</p>
                <p className="font-medium">{vendor.agreementStatus || '—'}</p>
                <p className="text-xs text-muted-foreground">Docs: {vendor.agreementDocuments || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Sources</p>
                {vendor.sources.map((src, i) => (
                  src.startsWith('http') ? (
                    <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1 truncate">
                      <ExternalLink className="h-3 w-3 shrink-0" /> {src.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  ) : (
                    <span key={i} className="text-xs text-muted-foreground block">{src}</span>
                  )
                ))}
              </div>
            </div>

            {/* Non-specialized (what they DON'T do) */}
            {vendor.nonSpecializedTechStack.length > 0 && (
              <>
                <Separator />
                <TagList items={vendor.nonSpecializedTechStack} icon={X} label="Not Specialized In" color="bg-destructive/5 border-destructive/20 text-destructive" query={searchQuery} max={6} />
              </>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
