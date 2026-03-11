import { useState } from 'react';
import { TenderUpdate } from '@/data/tenderUpdatesData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2, Users, Building2, Clock, ArrowRight } from 'lucide-react';
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

const subTypeIcons: Record<string, string> = {
  contacted: '📞',
  response: '✅',
  note: '📝',
  submission: '📤',
  extension: '⏰',
  clarification: '❓',
};

function TimelineCard({ update, canEdit, onDelete, index }: { update: TenderUpdate; canEdit: boolean; onDelete: (id: string) => void; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isSub = update.type === 'subcontractor';

  return (
    <div
      className="relative group animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Connector dot on timeline */}
      <div className={`absolute -left-[25px] top-4 w-3 h-3 rounded-full border-2 border-background z-10 transition-transform group-hover:scale-125 ${isSub ? 'bg-[hsl(var(--info))]' : 'bg-[hsl(var(--success))]'}`} />

      <div
        className={`relative rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer overflow-hidden ${
          expanded ? 'bg-card shadow-md' : 'bg-card/60 hover:bg-card'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Top accent line */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] ${isSub ? 'bg-[hsl(var(--info))]' : 'bg-[hsl(var(--success))]'}`} />

        <div className="p-3 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">{subTypeIcons[update.subType] || '📋'}</span>
              <Badge className={`${subTypeBadgeColors[update.subType] || 'bg-muted text-muted-foreground'} text-[10px] uppercase tracking-wider`} variant="secondary">
                {update.subType}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(update.date), 'dd MMM yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {update.dueDate && (
                <Badge variant="outline" className="text-[10px] border-[hsl(var(--warning))] text-[hsl(var(--warning))]">
                  Due {format(new Date(update.dueDate), 'dd MMM')}
                </Badge>
              )}
              {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </div>
          </div>

          <p className="text-sm font-semibold mt-2 flex items-center gap-1.5">
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            {update.actor}
          </p>

          {expanded && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-2 animate-fade-in">
              <p className="text-sm text-muted-foreground leading-relaxed">{update.details}</p>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground/70">
                  By {update.createdBy} • {format(new Date(update.createdAt), 'dd MMM yyyy HH:mm')}
                </p>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); onDelete(update.id); }}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Remove
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function UpdateTimeline({ updates, tenderName, canEdit, onDelete }: UpdateTimelineProps) {
  const subUpdates = updates.filter(u => u.type === 'subcontractor').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const clientUpdates = updates.filter(u => u.type === 'client').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
          <Clock className="h-7 w-7" />
        </div>
        <p className="text-sm">No updates yet. Click "Add Update" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subcontractor Lane */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--info))]/15 flex items-center justify-center">
              <Users className="h-4 w-4 text-[hsl(var(--info))]" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Subcontractor</h4>
              <p className="text-[11px] text-muted-foreground">{subUpdates.length} update{subUpdates.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="relative pl-5 border-l-2 border-[hsl(var(--info))]/30 space-y-3 ml-4">
            {subUpdates.map((u, i) => (
              <TimelineCard key={u.id} update={u} canEdit={canEdit} onDelete={onDelete} index={i} />
            ))}
            {subUpdates.length === 0 && <p className="text-xs text-muted-foreground pl-2 py-4">No subcontractor updates.</p>}
          </div>
        </div>

        {/* Client Lane */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--success))]/15 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-[hsl(var(--success))]" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Client</h4>
              <p className="text-[11px] text-muted-foreground">{clientUpdates.length} event{clientUpdates.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <div className="relative pl-5 border-l-2 border-[hsl(var(--success))]/30 space-y-3 ml-4">
            {clientUpdates.map((u, i) => (
              <TimelineCard key={u.id} update={u} canEdit={canEdit} onDelete={onDelete} index={i} />
            ))}
            {clientUpdates.length === 0 && <p className="text-xs text-muted-foreground pl-2 py-4">No client events.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
