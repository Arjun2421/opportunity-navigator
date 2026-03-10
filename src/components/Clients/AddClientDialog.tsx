import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { ClientContact } from '@/types/client';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: { name: string; city: string; country: string; domain: string; contacts: ClientContact[] }) => void;
}

export function AddClientDialog({ open, onOpenChange, onAdd }: AddClientDialogProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [domain, setDomain] = useState('');
  const [contacts, setContacts] = useState<Omit<ClientContact, 'id'>[]>([
    { firstName: '', lastName: '', email: '', phone: '' },
  ]);

  const addContactRow = () => {
    setContacts([...contacts, { firstName: '', lastName: '', email: '', phone: '' }]);
  };

  const removeContact = (idx: number) => {
    setContacts(contacts.filter((_, i) => i !== idx));
  };

  const updateContact = (idx: number, field: string, value: string) => {
    const updated = [...contacts];
    (updated[idx] as any)[field] = value;
    setContacts(updated);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name,
      city,
      country,
      domain,
      contacts: contacts
        .filter((c) => c.firstName || c.email)
        .map((c) => ({ ...c, id: crypto.randomUUID?.() || Math.random().toString(36).slice(2) })),
    });
    // Reset
    setName(''); setCity(''); setCountry(''); setDomain('');
    setContacts([{ firstName: '', lastName: '', email: '', phone: '' }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <Label>Company Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Corp" />
            </div>
            <div>
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dubai" />
            </div>
            <div>
              <Label>Country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="UAE" />
            </div>
            <div className="sm:col-span-2">
              <Label>Domain / Field</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Engineering, Construction..." />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Contacts</Label>
              <Button variant="ghost" size="sm" onClick={addContactRow} className="text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add Contact
              </Button>
            </div>
            <div className="space-y-3">
              {contacts.map((c, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Contact {idx + 1}</span>
                    {contacts.length > 1 && (
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeContact(idx)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="First Name" value={c.firstName} onChange={(e) => updateContact(idx, 'firstName', e.target.value)} className="text-sm" />
                    <Input placeholder="Last Name" value={c.lastName} onChange={(e) => updateContact(idx, 'lastName', e.target.value)} className="text-sm" />
                    <Input placeholder="Email" type="email" value={c.email} onChange={(e) => updateContact(idx, 'email', e.target.value)} className="text-sm" />
                    <Input placeholder="Phone" value={c.phone} onChange={(e) => updateContact(idx, 'phone', e.target.value)} className="text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>Add Client</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
