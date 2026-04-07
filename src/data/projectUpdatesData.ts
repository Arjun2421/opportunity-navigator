export type UpdateType = 'vendor_contacted' | 'vendor_response' | 'vendor_finalized' | 'extension_requested' | 'due_date_changed' | 'status_update' | 'general_note';
export type FinalDecision = 'accepted' | 'rejected' | 'negotiating';

export interface ProjectUpdate {
  id: string;
  tenderId: string;
  updateType: UpdateType;
  vendorName: string;
  parentUpdateId: string | null;
  responseDetails: string;
  contactDate: string | null;
  responseDate: string | null;
  extensionDate: string | null;
  finalizedDate: string | null;
  finalDecision: FinalDecision | null;
  finalInstructions: string;
  finalPrice: number | null;
  notes: string;
  updatedBy: string;
  createdAt: string;
}

const STORAGE_KEY = 'projectUpdates';

function generateId(): string {
  return 'pu-' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

const SEED: ProjectUpdate[] = [
  {
    id: 'pu-seed-1', tenderId: '1', updateType: 'vendor_contacted', vendorName: 'SubCo Alpha',
    parentUpdateId: null, responseDetails: '', contactDate: '2026-02-20', responseDate: null,
    extensionDate: null, finalizedDate: null, finalDecision: null, finalInstructions: '', finalPrice: null,
    notes: 'Reached out for pipeline rehabilitation scope pricing.', updatedBy: 'master@example.com', createdAt: '2026-02-20T10:00:00Z',
  },
  {
    id: 'pu-seed-2', tenderId: '1', updateType: 'vendor_response', vendorName: 'SubCo Alpha',
    parentUpdateId: 'pu-seed-1', responseDetails: 'Confirmed availability. Budget estimate: $1.2M. Lead time 6 weeks.',
    contactDate: null, responseDate: '2026-02-22', extensionDate: null, finalizedDate: null,
    finalDecision: null, finalInstructions: '', finalPrice: null,
    notes: '', updatedBy: 'master@example.com', createdAt: '2026-02-22T14:00:00Z',
  },
  {
    id: 'pu-seed-3', tenderId: '1', updateType: 'vendor_finalized', vendorName: 'SubCo Alpha',
    parentUpdateId: 'pu-seed-1', responseDetails: '',
    contactDate: null, responseDate: null, extensionDate: null, finalizedDate: '2026-03-01',
    finalDecision: 'accepted', finalInstructions: 'Proceed with mobilization by March 15. Submit insurance docs.',
    finalPrice: 1150000, notes: 'Negotiated down from 1.2M', updatedBy: 'master@example.com', createdAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'pu-seed-4', tenderId: '1', updateType: 'extension_requested', vendorName: '',
    parentUpdateId: null, responseDetails: '', contactDate: null, responseDate: null,
    extensionDate: '2026-03-15', finalizedDate: null, finalDecision: null, finalInstructions: '', finalPrice: null,
    notes: 'Client granted 7-day extension per email.', updatedBy: 'master@example.com', createdAt: '2026-03-05T12:00:00Z',
  },
  {
    id: 'pu-seed-5', tenderId: '2', updateType: 'vendor_contacted', vendorName: 'MEP Solutions Ltd',
    parentUpdateId: null, responseDetails: '', contactDate: '2026-02-18', responseDate: null,
    extensionDate: null, finalizedDate: null, finalDecision: null, finalInstructions: '', finalPrice: null,
    notes: 'Reached out for MEP scope pricing and timeline.', updatedBy: 'master@example.com', createdAt: '2026-02-18T09:00:00Z',
  },
  {
    id: 'pu-seed-6', tenderId: '2', updateType: 'status_update', vendorName: '',
    parentUpdateId: null, responseDetails: '', contactDate: null, responseDate: null,
    extensionDate: null, finalizedDate: null, finalDecision: null, finalInstructions: '', finalPrice: null,
    notes: 'Client clarified scope: HVAC must include redundancy for data center wing.', updatedBy: 'master@example.com', createdAt: '2026-02-25T11:00:00Z',
  },
];

function init(): ProjectUpdate[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED));
    return SEED;
  }
  return JSON.parse(stored);
}

export function getProjectUpdates(): ProjectUpdate[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return init();
  return JSON.parse(stored);
}

export function getUpdatesForTender(tenderId: string): ProjectUpdate[] {
  return getProjectUpdates()
    .filter(u => u.tenderId === tenderId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function addProjectUpdate(update: Omit<ProjectUpdate, 'id' | 'createdAt'>): ProjectUpdate {
  const all = getProjectUpdates();
  const newUpdate: ProjectUpdate = { ...update, id: generateId(), createdAt: new Date().toISOString() };
  all.push(newUpdate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return newUpdate;
}

export function getUpdateCount(tenderId: string): number {
  return getProjectUpdates().filter(u => u.tenderId === tenderId).length;
}

export function getLastUpdate(tenderId: string): ProjectUpdate | null {
  const updates = getUpdatesForTender(tenderId);
  return updates.length > 0 ? updates[updates.length - 1] : null;
}
