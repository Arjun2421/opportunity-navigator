import { useState } from 'react';
import { ProjectUpdate, UpdateType, FinalDecision } from '@/data/projectUpdatesData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info } from 'lucide-react';

interface AddUpdateFormProps {
  tenderId: string;
  existingUpdates: ProjectUpdate[];
  onSubmit: (data: Omit<ProjectUpdate, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  userEmail: string;
}

const UPDATE_TYPES: { value: UpdateType; label: string }[] = [
  { value: 'vendor_contacted', label: 'Vendor Contacted' },
  { value: 'vendor_response', label: 'Vendor Response' },
  { value: 'vendor_finalized', label: 'Vendor Finalized' },
  { value: 'extension_requested', label: 'Extension Requested' },
  { value: 'due_date_changed', label: 'Due Date Changed' },
  { value: 'status_update', label: 'Status Update' },
  { value: 'general_note', label: 'General Note' },
];

export function AddUpdateForm({ tenderId, existingUpdates, onSubmit, onCancel, userEmail }: AddUpdateFormProps) {
  const [updateType, setUpdateType] = useState<UpdateType>('vendor_contacted');
  const [vendorName, setVendorName] = useState('');
  const [parentUpdateId, setParentUpdateId] = useState<string>('');
  const [contactDate, setContactDate] = useState('');
  const [responseDate, setResponseDate] = useState('');
  const [responseDetails, setResponseDetails] = useState('');
  const [extensionDate, setExtensionDate] = useState('');
  const [finalizedDate, setFinalizedDate] = useState('');
  const [finalDecision, setFinalDecision] = useState<FinalDecision>('accepted');
  const [finalPrice, setFinalPrice] = useState('');
  const [finalInstructions, setFinalInstructions] = useState('');
  const [notes, setNotes] = useState('');

  const vendorContactedUpdates = existingUpdates.filter(u => u.updateType === 'vendor_contacted');
  const showParent = (updateType === 'vendor_response' || updateType === 'vendor_finalized') && vendorContactedUpdates.length > 0;
  const showVendorName = updateType === 'vendor_contacted' || ((updateType === 'vendor_response' || updateType === 'vendor_finalized') && !parentUpdateId);

  const handleSubmit = () => {
    const parentVendor = parentUpdateId ? vendorContactedUpdates.find(u => u.id === parentUpdateId)?.vendorName || '' : '';
    onSubmit({
      tenderId,
      updateType,
      vendorName: showVendorName ? vendorName : parentVendor,
      parentUpdateId: parentUpdateId || null,
      contactDate: contactDate || null,
      responseDate: responseDate || null,
      responseDetails,
      extensionDate: extensionDate || null,
      finalizedDate: finalizedDate || null,
      finalDecision: updateType === 'vendor_finalized' ? finalDecision : null,
      finalInstructions: updateType === 'vendor_finalized' ? finalInstructions : '',
      finalPrice: updateType === 'vendor_finalized' && finalPrice ? Number(finalPrice) : null,
      notes,
      updatedBy: userEmail,
    });
  };

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <Label>Update Type</Label>
        <Select value={updateType} onValueChange={(v) => setUpdateType(v as UpdateType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {UPDATE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {showParent && (
        <div>
          <Label>Link to Vendor Contact</Label>
          <Select value={parentUpdateId} onValueChange={setParentUpdateId}>
            <SelectTrigger><SelectValue placeholder="Select parent contact..." /></SelectTrigger>
            <SelectContent>
              {vendorContactedUpdates.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.vendorName} — {u.contactDate || 'No date'}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showVendorName && (
        <div>
          <Label>Vendor Name {updateType === 'vendor_contacted' && '*'}</Label>
          <Input value={vendorName} onChange={e => setVendorName(e.target.value)} placeholder="Enter vendor name" />
        </div>
      )}

      {updateType === 'vendor_contacted' && (
        <div>
          <Label>Contact Date</Label>
          <Input type="date" value={contactDate} onChange={e => setContactDate(e.target.value)} />
        </div>
      )}

      {updateType === 'vendor_response' && (
        <>
          <div>
            <Label>Response Date</Label>
            <Input type="date" value={responseDate} onChange={e => setResponseDate(e.target.value)} />
          </div>
          <div>
            <Label>Response Details *</Label>
            <Textarea value={responseDetails} onChange={e => setResponseDetails(e.target.value)} placeholder="Describe the vendor's response..." />
          </div>
        </>
      )}

      {updateType === 'vendor_finalized' && (
        <>
          <div className="rounded-lg border border-[hsl(var(--success))]/30 bg-[hsl(var(--success))]/5 p-3 flex items-start gap-2">
            <Info className="h-4 w-4 text-[hsl(var(--success))] mt-0.5 shrink-0" />
            <p className="text-xs text-[hsl(var(--success))]">Vendor Finalization Details — Record final instructions, decisions, and agreed terms</p>
          </div>
          <div>
            <Label>Finalized Date</Label>
            <Input type="date" value={finalizedDate} onChange={e => setFinalizedDate(e.target.value)} />
          </div>
          <div>
            <Label>Final Decision</Label>
            <Select value={finalDecision} onValueChange={v => setFinalDecision(v as FinalDecision)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="accepted">Accepted ✅</SelectItem>
                <SelectItem value="negotiating">Negotiating 🔄</SelectItem>
                <SelectItem value="rejected">Rejected ❌</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Final Price (USD)</Label>
            <Input type="number" value={finalPrice} onChange={e => setFinalPrice(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <Label>Final Instructions *</Label>
            <Textarea value={finalInstructions} onChange={e => setFinalInstructions(e.target.value)} placeholder="Instructions given to or received from vendor..." />
          </div>
        </>
      )}

      {(updateType === 'extension_requested' || updateType === 'due_date_changed') && (
        <div>
          <Label>Extension / New Date</Label>
          <Input type="date" value={extensionDate} onChange={e => setExtensionDate(e.target.value)} />
        </div>
      )}

      <div>
        <Label>Notes (optional)</Label>
        <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit}>Log Update</Button>
      </div>
    </div>
  );
}
