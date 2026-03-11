import { useState } from 'react';
import { getAllUpcomingDueDates } from '@/data/tenderUpdatesData';
import { TenderData } from '@/services/dataCollection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarClock, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface DueDatesWidgetProps {
  tenders: TenderData[];
  onSelectTender: (id: string) => void;
}

export function DueDatesWidget({ tenders, onSelectTender }: DueDatesWidgetProps) {
  const [days, setDays] = useState(30);
  const [expanded, setExpanded] = useState(false);
  const dueDates = getAllUpcomingDueDates(days);
  const tenderMap = new Map(tenders.map(t => [t.id, t]));

  if (dueDates.length === 0 && !expanded) {
    return null; // Don't show widget if no due dates
  }

  const urgentCount = dueDates.filter(dd => differenceInDays(new Date(dd.dueDate), new Date()) <= 7).length;

  return (
    <div className="rounded-xl border bg-card/80 backdrop-blur-sm overflow-hidden">
      {/* Header - always visible, clickable to expand */}
      <button
        className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarClock className="h-5 w-5 text-[hsl(var(--warning))]" />
            {urgentCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[hsl(var(--destructive))] text-[8px] text-[hsl(var(--destructive-foreground))] flex items-center justify-center font-bold">
                {urgentCount}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold">
            Upcoming Due Dates
            <span className="text-muted-foreground font-normal ml-2">({dueDates.length})</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 bg-muted/50 rounded-md p-0.5">
            {[30, 60, 90].map(d => (
              <Button
                key={d}
                variant={days === d ? 'default' : 'ghost'}
                size="sm"
                className={`h-6 text-[10px] px-2 ${days === d ? '' : 'hover:bg-muted'}`}
                onClick={(e) => { e.stopPropagation(); setDays(d); }}
              >
                {d}d
              </Button>
            ))}
          </div>
          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Expandable content */}
      {expanded && (
        <div className="border-t px-3 pb-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-3 max-h-52 overflow-y-auto scrollbar-thin">
            {dueDates.map((dd, i) => {
              const tender = tenderMap.get(dd.opportunityId);
              const daysLeft = differenceInDays(new Date(dd.dueDate), new Date());
              const isUrgent = daysLeft <= 7;
              const isOverdue = daysLeft <= 0;

              return (
                <button
                  key={i}
                  className={`text-left p-2.5 rounded-lg border transition-all hover:shadow-md hover:-translate-y-0.5 ${
                    isOverdue
                      ? 'border-[hsl(var(--destructive))]/40 bg-[hsl(var(--destructive))]/5 hover:bg-[hsl(var(--destructive))]/10'
                      : isUrgent
                      ? 'border-[hsl(var(--warning))]/40 bg-[hsl(var(--warning))]/5 hover:bg-[hsl(var(--warning))]/10'
                      : 'border-border/50 hover:bg-muted/30'
                  }`}
                  onClick={() => onSelectTender(dd.opportunityId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold truncate flex-1">{tender?.tenderName || dd.opportunityId}</span>
                    {isOverdue && <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--destructive))] shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge
                      variant={isOverdue ? 'destructive' : isUrgent ? 'default' : 'secondary'}
                      className="text-[9px] px-1.5"
                    >
                      {isOverdue ? 'OVERDUE' : `${daysLeft}d left`}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {format(new Date(dd.dueDate), 'dd MMM')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
