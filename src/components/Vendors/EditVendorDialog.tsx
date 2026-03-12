import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil } from 'lucide-react';
import { updateVendor, VendorData } from '@/data/vendorData';
import { toast } from '@/hooks/use-toast';

interface EditVendorDialogProps {
  vendor: VendorData | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditVendorDialog({ vendor, open, onClose, onUpdated }: EditVendorDialogProps) {
  const [form, setForm] = useState({
    companyName: '', focusArea: '', companySize: '', agreementStatus: '',
    agreementDocuments: '', contactPerson: '', emails: '',
    primaryIndustries: '', confirmedServices: '', confirmedTechStack: '',
    nonSpecializedTechStack: '', sampleProjects: '', certifications: '',
    partners: '', sources: '',
  });

  useEffect(() => {
    if (vendor) {
      setForm({
        companyName: vendor.companyName,
        focusArea: vendor.focusArea,
        companySize: vendor.companySize,
        agreementStatus: vendor.agreementStatus,
        agreementDocuments: vendor.agreementDocuments,
        contactPerson: vendor.contactPerson,
        emails: vendor.emails.join(', '),
        primaryIndustries: vendor.primaryIndustries.join(', '),
        confirmedServices: vendor.confirmedServices.join(', '),
        confirmedTechStack: vendor.confirmedTechStack.join(', '),
        nonSpecializedTechStack: vendor.nonSpecializedTechStack.join(', '),
        sampleProjects: vendor.sampleProjects.join(', '),
        certifications: vendor.certifications.join(', '),
        partners: vendor.partners.join(', '),
        sources: vendor.sources.join(', '),
      });
    }
  }, [vendor]);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));
  const split = (v: string) => v.split(/,\s*/).map(s => s.trim()).filter(Boolean);

  const handleSave = () => {
    if (!vendor) return;
    updateVendor(vendor.id, {
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
    toast({ title: 'Vendor updated successfully' });
    onUpdated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Vendor
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] px-6 pb-2">
          <div className="space-y-4 pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 col-span-2">
                <Label>Company Name *</Label>
                <Input value={form.companyName} onChange={e => update('companyName', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Focus Area</Label>
                <Input value={form.focusArea} onChange={e => update('focusArea', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Company Size</Label>
                <Input value={form.companySize} onChange={e => update('companySize', e.target.value)} />
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
                <Input value={form.contactPerson} onChange={e => update('contactPerson', e.target.value)} />
              </div>
            </div>
            <Separator />
            <p className="text-xs text-muted-foreground">Comma-separated values below</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Emails</Label>
                <Input value={form.emails} onChange={e => update('emails', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Tech Stack</Label>
                <Textarea value={form.confirmedTechStack} onChange={e => update('confirmedTechStack', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Services</Label>
                <Textarea value={form.confirmedServices} onChange={e => update('confirmedServices', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Industries</Label>
                <Textarea value={form.primaryIndustries} onChange={e => update('primaryIndustries', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Certifications</Label>
                <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Partners</Label>
                <Input value={form.partners} onChange={e => update('partners', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Agreement Documents</Label>
                <Input value={form.agreementDocuments} onChange={e => update('agreementDocuments', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Sample Projects</Label>
                <Textarea value={form.sampleProjects} onChange={e => update('sampleProjects', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Non-Specialized Tech</Label>
                <Textarea value={form.nonSpecializedTechStack} onChange={e => update('nonSpecializedTechStack', e.target.value)} rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label>Sources</Label>
                <Input value={form.sources} onChange={e => update('sources', e.target.value)} />
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
