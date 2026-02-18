import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Save, Building2 } from 'lucide-react';
import { addVendor, getVendors, deleteVendor, VendorData } from '@/data/vendorData';
import { toast } from '@/hooks/use-toast';

const EMPTY_FORM = {
  companyName: '',
  primaryIndustries: '',
  confirmedServices: '',
  confirmedTechStack: '',
  nonSpecializedTechStack: '',
  sampleProjects: '',
  certifications: '',
  partners: '',
  companySize: '',
  sources: '',
  focusArea: '',
  agreementStatus: '',
  agreementDocuments: '',
  contactPerson: '',
  emails: '',
};

export default function VendorManagement() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [vendors, setVendors] = useState<VendorData[]>(() => getVendors());

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = () => {
    if (!form.companyName.trim()) {
      toast({ title: 'Company Name is required', variant: 'destructive' });
      return;
    }

    const split = (v: string) => v.split(/,\s*/).map(s => s.trim()).filter(Boolean);

    addVendor({
      companyName: form.companyName.trim(),
      primaryIndustries: split(form.primaryIndustries),
      confirmedServices: split(form.confirmedServices),
      confirmedTechStack: split(form.confirmedTechStack),
      nonSpecializedTechStack: split(form.nonSpecializedTechStack),
      sampleProjects: split(form.sampleProjects),
      certifications: split(form.certifications),
      partners: split(form.partners),
      companySize: form.companySize.trim(),
      sources: split(form.sources),
      focusArea: form.focusArea.trim(),
      agreementStatus: form.agreementStatus,
      agreementDocuments: form.agreementDocuments.trim(),
      contactPerson: form.contactPerson.trim(),
      emails: split(form.emails),
    });

    setVendors(getVendors());
    setForm(EMPTY_FORM);
    toast({ title: 'Vendor added successfully' });
  };

  const handleDelete = (id: string) => {
    deleteVendor(id);
    setVendors(getVendors());
    toast({ title: 'Vendor deleted' });
  };

  return (
    <div className="space-y-6">
      {/* Add Vendor Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-primary" />
            Add New Vendor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Company Name *</Label>
              <Input value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="e.g. GigLabz" />
            </div>
            <div className="space-y-1.5">
              <Label>Focus Area</Label>
              <Input value={form.focusArea} onChange={e => update('focusArea', e.target.value)} placeholder="e.g. Cybersecurity / AI" />
            </div>
            <div className="space-y-1.5">
              <Label>Company Size</Label>
              <Input value={form.companySize} onChange={e => update('companySize', e.target.value)} placeholder="e.g. 11-50 employees" />
            </div>
            <div className="space-y-1.5">
              <Label>Agreement Status</Label>
              <Select value={form.agreementStatus} onValueChange={v => update('agreementStatus', v)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="NDA">NDA</SelectItem>
                  <SelectItem value="Association Agreement">Association Agreement</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Agreement Documents</Label>
              <Input value={form.agreementDocuments} onChange={e => update('agreementDocuments', e.target.value)} placeholder="e.g. Available / Resolving comments" />
            </div>
            <div className="space-y-1.5">
              <Label>Contact Person</Label>
              <Input value={form.contactPerson} onChange={e => update('contactPerson', e.target.value)} placeholder="e.g. Sukesh" />
            </div>
          </div>

          <Separator />
          <p className="text-xs text-muted-foreground">Comma-separated values for the fields below</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Emails</Label>
              <Input value={form.emails} onChange={e => update('emails', e.target.value)} placeholder="email1@co.com, email2@co.com" />
            </div>
            <div className="space-y-1.5">
              <Label>Primary Industries</Label>
              <Textarea value={form.primaryIndustries} onChange={e => update('primaryIndustries', e.target.value)} placeholder="Healthcare, BFSI, Oil & Gas" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirmed Services</Label>
              <Textarea value={form.confirmedServices} onChange={e => update('confirmedServices', e.target.value)} placeholder="AI Development, Cloud Migration" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Tech Stack</Label>
              <Textarea value={form.confirmedTechStack} onChange={e => update('confirmedTechStack', e.target.value)} placeholder="Python, React, AWS, Docker" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Non-Specialized Tech</Label>
              <Textarea value={form.nonSpecializedTechStack} onChange={e => update('nonSpecializedTechStack', e.target.value)} placeholder="Areas they don't specialize in" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Sample Projects</Label>
              <Textarea value={form.sampleProjects} onChange={e => update('sampleProjects', e.target.value)} placeholder="Project A, Project B" rows={2} />
            </div>
            <div className="space-y-1.5">
              <Label>Certifications</Label>
              <Input value={form.certifications} onChange={e => update('certifications', e.target.value)} placeholder="ISO 9001, ISO 27001" />
            </div>
            <div className="space-y-1.5">
              <Label>Partners</Label>
              <Input value={form.partners} onChange={e => update('partners', e.target.value)} placeholder="AWS, Microsoft, Google" />
            </div>
            <div className="space-y-1.5">
              <Label>Sources / URLs</Label>
              <Input value={form.sources} onChange={e => update('sources', e.target.value)} placeholder="https://company.com, LinkedIn" />
            </div>
          </div>

          <Button onClick={handleSubmit} className="gap-2">
            <Save className="h-4 w-4" />
            Add Vendor
          </Button>
        </CardContent>
      </Card>

      {/* Existing Vendors List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Existing Vendors ({vendors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {vendors.map(v => (
              <div key={v.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{v.companyName}</p>
                  <div className="flex gap-2 mt-0.5">
                    {v.agreementStatus && <Badge variant="outline" className="text-[10px]">{v.agreementStatus}</Badge>}
                    <span className="text-xs text-muted-foreground">{v.companySize}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => handleDelete(v.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
