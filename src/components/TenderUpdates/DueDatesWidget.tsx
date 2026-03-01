import { useState } from 'react';
import { getAllUpcomingDueDates } from '@/data/tenderUpdatesData';
import { TenderData } from '@/services/dataCollection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface DueDatesWidgetProps {
  tenders: TenderData[];
  onSelectTender: (id: string) => void;
}

export function DueDatesWidget({ tenders, onSelectTender }: DueDatesWidgetProps) {
  const [days, setDays] = useState(30);
  const dueDates = getAllUpcomingDueDates(days);

  const tenderMap = new Map(tenders.map(t => [t.id, t]));

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <CalendarClock className="h-4 w-4 text-warning" />
          Upcoming Due Dates
        </div>
        <div className="flex gap-1">
          {[30, 60, 90].map(d => (
            <Button key={d} variant={days === d ? 'default' : 'outline'} size="sm" className="h-6 text-xs px-2" onClick={() => setDays(d)}>
              {d}d
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {dueDates.length === 0 && <p className="text-xs text-muted-foreground">No upcoming due dates.</p>}
        {dueDates.map((dd, i) => {
          const tender = tenderMap.get(dd.opportunityId);
          const daysLeft = differenceInDays(new Date(dd.dueDate), new Date());
          return (
            <button
              key={i}
              className="w-full text-left p-2 rounded-md border hover:bg-accent/10 transition-colors text-sm"
              onClick={() => onSelectTender(dd.opportunityId)}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium truncate">{tender?.tenderName || dd.opportunityId}</span>
                <Badge variant={daysLeft <= 7 ? 'destructive' : daysLeft <= 14 ? 'default' : 'secondary'} className="text-[10px]">
                  {daysLeft <= 0 ? 'Overdue' : `${daysLeft}d left`}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {dd.subType} • {format(new Date(dd.dueDate), 'dd MMM yyyy')}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
