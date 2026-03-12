import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { addVendor, VendorData } from '@/data/vendorData';
import { toast } from '@/hooks/use-toast';

interface AddVendorDialogProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const EMPTY = {
  companyName: '', focusArea: '', companySize: '', agreementStatus: '',
  agreementDocuments: '', contactPerson: '', emails: '',
  primaryIndustries: '', confirmedServices: '', confirmedTechStack: '',
  nonSpecializedTechStack: '', sampleProjects: '', certifications: '',
  partners: '', sources: '',
};

export function AddVendorDialog({ open, onClose, onAdded }: AddVendorDialogProps) {
  const [form, setForm] = useState(EMPTY);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const split = (v: string) => v.split(/,\s*/).map(s => s.trim()).filter(Boolean);

  const handleSubmit = () => {
    if (!form.companyName.trim()) {
      toast({ title: 'Company Name is required', variant: 'destructive' });
      return;
    }
    addVendor({
      companyName: form.companyName.trim(),
      focusArea: form.focusArea.trim(),
      companySize: form.companySize.trim(),
      agreementStatus: form.agreementStatus,
      agreementDocuments: form.agreementDocuments.trim(),
      contactPerson: form.contactPerson.trim(),
      emails: split(form.emails),
      primaryIndustries: split(form.primaryIndustries),
      confirmedServices: split(form.confirmedServices),
      confirmedTechStack: split(form.confirmedTechStack),
      nonSpecializedTechStack: split(form.nonSpecializedTechStack),
      sampleProjects: split(form.sampleProjects),
      certifications: split(form.certifications),
      partners: split(form.partners),
      sources: split(form.sources),
    });
    toast({ title: 'Vendor added successfully' });
    setForm(EMPTY);
    onAdded();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={() => { setForm(EMPTY); onClose(); }}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Add New Vendor
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] px-6 pb-2">
          <div className="space-y-4 pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Company Name *</Label>
                <Input value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="e.g. GigLabz" />
              </div>
              <div className="space-y-1.5">
                <Label>Focus Area</Label>
                <Input value={form.focusArea} onChange={e => update('focusArea', e.target.value)} placeholder="e.g. AI / Cloud" />
              </div>
              <div className="space-y-1.5">
                <Label>Company Size</Label>
                <Input value={form.companySize} onChange={e => update('companySize', e.target.value)} placeholder="e.g. 51-200" />
              </div>
              <div className="space-y-1.5">
                <Label>Agreement Status</Label>
                <Select value={form.agreementStatus} onValueChange={v => update('agreementStatus', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NDA">NDA</SelectItem>
                    <SelectItem value="Association Agreement">Association Agreement</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Contact Person</Label>
                <Input value={form.contactPerson} onChange={e => update('contactPerson', e.target.value)} placeholder="e.g. John" />
              </div>
            </div>

            <Separator />
            <p className="text-xs text-muted-foreground">Comma-separated values below</p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Emails</Label>
                <Input value={form.emails} onChange={e => update('emails', e.target.value)} placeholder="a@co.com, b@co.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Tech Stack</Label>
                <Textarea value={form.confirmedTechStack} onChange={e => update('confirmedTechStack', e.target.value)} placeholder="Python, React, AWS" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Services</Label>
                <Textarea value={form.confirmedServices} onChange={e => update('confirmedServices', e.target.value)} placeholder="AI Development, Cloud" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Industries</Label>
                <Textarea value={form.primaryIndustries} onChange={e => update('primaryIndustries', e.target.value)} placeholder="Healthcare, BFSI" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Certifications</Label>
                <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="ISO 27001, SOC 2" />
              </div>
              <div className="space-y-1.5">
                <Label>Partners</Label>
                <Input value={form.partners} onChange={e => update('partners', e.target.value)} placeholder="AWS, Microsoft" />
              </div>
              <div className="space-y-1.5">
                <Label>Agreement Documents</Label>
                <Input value={form.agreementDocuments} onChange={e => update('agreementDocuments', e.target.value)} placeholder="Available / Resolving" />
              </div>
              <div className="space-y-1.5">
                <Label>Sample Projects</Label>
                <Textarea value={form.sampleProjects} onChange={e => update('sampleProjects', e.target.value)} placeholder="Project A, Project B" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Non-Specialized Tech</Label>
                <Textarea value={form.nonSpecializedTechStack} onChange={e => update('nonSpecializedTechStack', e.target.value)} placeholder="Areas not specialized in" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Sources / URLs</Label>
                <Input value={form.sources} onChange={e => update('sources', e.target.value)} placeholder="https://company.com" />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => { setForm(EMPTY); onClose(); }}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Vendor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
