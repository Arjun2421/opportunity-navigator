export interface TenderUpdate {
  id: string;
  opportunityId: string;
  type: 'subcontractor' | 'client';
  subType: 'contacted' | 'response' | 'note' | 'submission' | 'extension' | 'clarification';
  actor: string;
  date: string;
  dueDate: string | null;
  details: string;
  attachments: string[];
  createdBy: string;
  createdAt: string;
}

const STORAGE_KEY = 'tenderUpdates';

function generateId(): string {
  return 'tu-' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

const SEED_UPDATES: TenderUpdate[] = [
  {
    id: 'seed-1',
    opportunityId: 'seed-op-1',
    type: 'subcontractor',
    subType: 'contacted',
    actor: 'SubCo Alpha',
    date: '2026-02-20T10:00:00Z',
    dueDate: null,
    details: 'Called subcontractor to confirm availability for pipeline rehabilitation scope.',
    attachments: [],
    createdBy: 'Master User',
    createdAt: '2026-02-20T10:05:00Z',
  },
  {
    id: 'seed-2',
    opportunityId: 'seed-op-1',
    type: 'subcontractor',
    subType: 'response',
    actor: 'SubCo Alpha',
    date: '2026-02-22T14:00:00Z',
    dueDate: null,
    details: 'Confirmed availability. Budget estimate: AED 1.2M. Lead time 6 weeks.',
    attachments: [],
    createdBy: 'Master User',
    createdAt: '2026-02-22T14:10:00Z',
  },
  {
    id: 'seed-3',
    opportunityId: 'seed-op-1',
    type: 'client',
    subType: 'submission',
    actor: 'Client PM',
    date: '2026-03-08T00:00:00Z',
    dueDate: '2026-03-08T00:00:00Z',
    details: 'Original submission due date per RFP.',
    attachments: [],
    createdBy: 'System',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'seed-4',
    opportunityId: 'seed-op-1',
    type: 'client',
    subType: 'extension',
    actor: 'Client PM',
    date: '2026-03-05T12:00:00Z',
    dueDate: '2026-03-15T00:00:00Z',
    details: 'Submission extended by 7 days per client email.',
    attachments: [],
    createdBy: 'Master User',
    createdAt: '2026-03-05T12:01:00Z',
  },
  {
    id: 'seed-5',
    opportunityId: 'seed-op-2',
    type: 'subcontractor',
    subType: 'contacted',
    actor: 'MEP Solutions Ltd',
    date: '2026-02-18T09:00:00Z',
    dueDate: null,
    details: 'Reached out for MEP scope pricing and timeline.',
    attachments: [],
    createdBy: 'Proposal Head',
    createdAt: '2026-02-18T09:05:00Z',
  },
  {
    id: 'seed-6',
    opportunityId: 'seed-op-2',
    type: 'client',
    subType: 'clarification',
    actor: 'Client Engineer',
    date: '2026-02-25T11:00:00Z',
    dueDate: null,
    details: 'Client clarified scope: HVAC system must include redundancy for data center wing.',
    attachments: [],
    createdBy: 'Master User',
    createdAt: '2026-02-25T11:05:00Z',
  },
  {
    id: 'seed-7',
    opportunityId: 'seed-op-2',
    type: 'client',
    subType: 'submission',
    actor: 'Client PM',
    date: '2026-03-20T00:00:00Z',
    dueDate: '2026-03-20T00:00:00Z',
    details: 'Submission due date.',
    attachments: [],
    createdBy: 'System',
    createdAt: '2026-01-20T00:00:00Z',
  },
];

function initSeedData(): TenderUpdate[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_UPDATES));
    return SEED_UPDATES;
  }
  return JSON.parse(stored);
}

export function getTenderUpdates(): TenderUpdate[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return initSeedData();
  return JSON.parse(stored);
}

export function getUpdatesForOpportunity(opportunityId: string): TenderUpdate[] {
  return getTenderUpdates().filter(u => u.opportunityId === opportunityId);
}

export function addTenderUpdate(update: Omit<TenderUpdate, 'id' | 'createdAt'>): TenderUpdate {
  const updates = getTenderUpdates();
  const newUpdate: TenderUpdate = {
    ...update,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  updates.push(newUpdate);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
  return newUpdate;
}

export function deleteTenderUpdate(id: string): void {
  const updates = getTenderUpdates().filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updates));
}

export function getNextDueDate(opportunityId: string): { date: string; status: 'overdue' | 'urgent' | 'upcoming' | 'safe' } | null {
  const updates = getUpdatesForOpportunity(opportunityId);
  const now = new Date();
  const dueDates = updates
    .filter(u => u.dueDate)
    .map(u => new Date(u.dueDate!))
    .filter(d => !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());

  // Find the latest extension or earliest upcoming
  const futureOrRecent = dueDates.filter(d => d.getTime() >= now.getTime() - 86400000 * 30);
  const nextDue = futureOrRecent.length > 0 ? futureOrRecent[futureOrRecent.length - 1] : dueDates[dueDates.length - 1];

  if (!nextDue) return null;

  const diffDays = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let status: 'overdue' | 'urgent' | 'upcoming' | 'safe' = 'safe';
  if (diffDays < 0) status = 'overdue';
  else if (diffDays <= 7) status = 'urgent';
  else if (diffDays <= 30) status = 'upcoming';

  return { date: nextDue.toISOString(), status };
}

export function getAllUpcomingDueDates(days: number = 30): { opportunityId: string; dueDate: string; subType: string; actor: string; details: string }[] {
  const updates = getTenderUpdates();
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 86400000);

  return updates
    .filter(u => u.dueDate && new Date(u.dueDate) >= now && new Date(u.dueDate) <= cutoff)
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .map(u => ({
      opportunityId: u.opportunityId,
      dueDate: u.dueDate!,
      subType: u.subType,
      actor: u.actor,
      details: u.details,
    }));
}

export function generateMermaidDiagram(
  tenders: { id: string; tenderName: string; refNo: string; groupClassification: string }[],
  updates: TenderUpdate[]
): string {
  const groups = new Map<string, typeof tenders>();
  tenders.forEach(t => {
    const g = t.groupClassification || 'Ungrouped';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(t);
  });

  let mermaid = 'graph TB\n';
  groups.forEach((groupTenders, groupName) => {
    const gId = groupName.replace(/[^a-zA-Z0-9]/g, '_');
    mermaid += `  subgraph ${gId}["${groupName}"]\n`;
    groupTenders.forEach(t => {
      const tId = `OP_${t.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      mermaid += `    ${tId}["${t.tenderName} (${t.refNo})"]\n`;
      const tUpdates = updates.filter(u => u.opportunityId === t.id);
      tUpdates.forEach(u => {
        const uId = `U_${u.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
        const prefix = u.type === 'subcontractor' ? 'SC' : 'CL';
        const dateStr = new Date(u.date).toLocaleDateString();
        mermaid += `    ${tId} --> ${uId}["${prefix}: ${u.subType} — ${dateStr}"]\n`;
      });
    });
    mermaid += '  end\n';
  });

  return mermaid;
}
