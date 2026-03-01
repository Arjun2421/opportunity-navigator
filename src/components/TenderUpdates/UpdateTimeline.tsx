import { useState } from 'react';
import { TenderUpdate } from '@/data/tenderUpdatesData';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2, Users, Building2 } from 'lucide-react';
import { format } from 'date-fns';

interface UpdateTimelineProps {
  updates: TenderUpdate[];
  tenderName: string;
  canEdit: boolean;
  onDelete: (id: string) => void;
}

const subTypeBadgeColors: Record<string, string> = {
  contacted: 'bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]',
  response: 'bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]',
  note: 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]',
  submission: 'bg-[hsl(var(--warning))] text-[hsl(var(--warning-foreground))]',
  extension: 'bg-[hsl(var(--pending))] text-[hsl(var(--pending-foreground))]',
  clarification: 'bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]',
};

function TimelineCard({ update, canEdit, onDelete }: { update: TenderUpdate; canEdit: boolean; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="p-3 border-l-4 transition-all hover:shadow-md" style={{
      borderLeftColor: update.type === 'subcontractor' ? 'hsl(var(--info))' : 'hsl(var(--success))'
    }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Badge className={subTypeBadgeColors[update.subType] || 'bg-muted text-muted-foreground'} variant="secondary">
            {update.subType}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {format(new Date(update.date), 'dd MMM yyyy')}
          </span>
          {update.dueDate && (
            <span className="text-xs text-warning font-medium">
              Due: {format(new Date(update.dueDate), 'dd MMM')}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          {canEdit && (
            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(update.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm font-medium mt-1">{update.actor}</p>
      {expanded && (
        <div className="mt-2 text-sm text-muted-foreground border-t pt-2">
          <p>{update.details}</p>
          <p className="text-xs mt-1">By {update.createdBy} • {format(new Date(update.createdAt), 'dd MMM yyyy HH:mm')}</p>
        </div>
      )}
    </Card>
  );
}

export function UpdateTimeline({ updates, tenderName, canEdit, onDelete }: UpdateTimelineProps) {
  const subUpdates = updates.filter(u => u.type === 'subcontractor').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const clientUpdates = updates.filter(u => u.type === 'client').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (updates.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>No updates yet. Click "Add Update" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{tenderName}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Subcontractor Lane */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--info))]">
            <Users className="h-4 w-4" />
            Subcontractor Updates ({subUpdates.length})
          </div>
          <div className="space-y-2">
            {subUpdates.map(u => (
              <TimelineCard key={u.id} update={u} canEdit={canEdit} onDelete={onDelete} />
            ))}
            {subUpdates.length === 0 && <p className="text-xs text-muted-foreground">No subcontractor updates.</p>}
          </div>
        </div>
        {/* Client Lane */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[hsl(var(--success))]">
            <Building2 className="h-4 w-4" />
            Client Events ({clientUpdates.length})
          </div>
          <div className="space-y-2">
            {clientUpdates.map(u => (
              <TimelineCard key={u.id} update={u} canEdit={canEdit} onDelete={onDelete} />
            ))}
            {clientUpdates.length === 0 && <p className="text-xs text-muted-foreground">No client events.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
