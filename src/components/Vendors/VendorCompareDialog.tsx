import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { VendorData } from '@/data/vendorData';
import { Cpu, Globe, Award, Handshake, Briefcase, Users, Shield } from 'lucide-react';

interface VendorCompareDialogProps {
  vendors: VendorData[];
  open: boolean;
  onClose: () => void;
}

function CompareSection({ label, icon: Icon, items }: { label: string; icon: any; items: (string[] | string)[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map((item, i) => (
          <div key={i} className="space-y-1">
            {Array.isArray(item) ? (
              item.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {item.map((val, j) => (
                    <Badge key={j} variant="secondary" className="text-[10px]">{val}</Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted-foreground italic">None</span>
              )
            ) : (
              <span className="text-xs">{item || '—'}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VendorCompareDialog({ vendors, open, onClose }: VendorCompareDialogProps) {
  if (vendors.length < 2) return null;

  const sections = [
    { label: 'Company Size', icon: Users, items: vendors.map(v => v.companySize) },
    { label: 'Focus Area', icon: Shield, items: vendors.map(v => v.focusArea) },
    { label: 'Agreement Status', icon: Shield, items: vendors.map(v => v.agreementStatus || '—') },
    { label: 'Tech Stack', icon: Cpu, items: vendors.map(v => v.confirmedTechStack) },
    { label: 'Services', icon: Briefcase, items: vendors.map(v => v.confirmedServices) },
    { label: 'Industries', icon: Globe, items: vendors.map(v => v.primaryIndustries) },
    { label: 'Certifications', icon: Award, items: vendors.map(v => v.certifications) },
    { label: 'Partners', icon: Handshake, items: vendors.map(v => v.partners) },
  ];

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-3">
          <DialogHeader>
            <DialogTitle>Vendor Comparison</DialogTitle>
          </DialogHeader>
          {/* Vendor name headers */}
          <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: `repeat(${vendors.length}, 1fr)` }}>
            {vendors.map(v => (
              <div key={v.id} className="text-center">
                <p className="font-bold text-sm">{v.companyName}</p>
                <Badge variant="outline" className="text-[10px] mt-1">{v.agreementStatus}</Badge>
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <ScrollArea className="max-h-[60vh]">
          <div className="px-6 pb-6 space-y-5 pt-4">
            {sections.map((section, i) => (
              <CompareSection key={i} label={section.label} icon={section.icon} items={section.items} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
