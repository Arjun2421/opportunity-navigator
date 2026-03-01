import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addTenderUpdate, TenderUpdate } from '@/data/tenderUpdatesData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AddUpdateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  tenderName: string;
  onAdded: () => void;
}

export function AddUpdateModal({ open, onOpenChange, opportunityId, tenderName, onAdded }: AddUpdateModalProps) {
  const { user } = useAuth();
  const [type, setType] = useState<'subcontractor' | 'client'>('subcontractor');
  const [subType, setSubType] = useState<TenderUpdate['subType']>('contacted');
  const [actor, setActor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [details, setDetails] = useState('');

  const subTypeOptions: Record<string, TenderUpdate['subType'][]> = {
    subcontractor: ['contacted', 'response', 'note'],
    client: ['submission', 'extension', 'clarification'],
  };

  const handleSubmit = () => {
    if (!actor || !details) {
      toast.error('Please fill in Actor and Details.');
      return;
    }
    addTenderUpdate({
      opportunityId,
      type,
      subType,
      actor,
      date: new Date(date).toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      details,
      attachments: [],
      createdBy: user?.displayName || 'Unknown',
    });
    toast.success('Update added successfully');
    onAdded();
    onOpenChange(false);
    // Reset
    setActor('');
    setDetails('');
    setDueDate('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Update — {tenderName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v: 'subcontractor' | 'client') => { setType(v); setSubType(subTypeOptions[v][0]); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sub-Type</Label>
              <Select value={subType} onValueChange={(v) => setSubType(v as TenderUpdate['subType'])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subTypeOptions[type].map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Actor (Name)</Label>
            <Input value={actor} onChange={e => setActor(e.target.value)} placeholder="e.g. SubCo Alpha or Client PM" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Due Date (optional)</Label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Details</Label>
            <Textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Describe the update..." rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Add Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
