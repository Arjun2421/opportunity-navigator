import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { TenderData } from '@/services/dataCollection';

interface AtRiskWidgetProps {
  data: TenderData[];
  onSelectTender?: (tender: TenderData) => void;
}

export function AtRiskWidget({ data, onSelectTender }: AtRiskWidgetProps) {
  const atRiskItems = data.slice(0, 8);

  const getDaysUntilDeadline = (rfpDate: string | null): number => {
    if (!rfpDate) return 0;
    const received = new Date(rfpDate);
    const deadline = new Date(received);
    deadline.setDate(received.getDate() + 7);
    const today = new Date();
    return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-destructive" />
          Submission Within a Week
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {atRiskItems.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No tenders due within 7 days
          </p>
        ) : (
          atRiskItems.map((tender) => {
            const daysLeft = getDaysUntilDeadline(tender.rfpReceivedDate);
            const isUrgent = daysLeft <= 2;
            
            return (
              <div
                key={tender.id}
                className={`p-3 rounded-lg border transition-colors ${
                  onSelectTender ? 'cursor-pointer hover:bg-muted/50' : ''
                } ${isUrgent ? 'border-destructive/50 bg-destructive/5' : ''}`}
                onClick={() => onSelectTender?.(tender)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{tender.tenderName || tender.client}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{tender.client}</span>
                      <span>•</span>
                      <span>{tender.lead || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {isUrgent ? (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {daysLeft <= 0 ? 'Due' : `${daysLeft}d left`}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Clock className="h-3 w-3" />
                        {daysLeft}d left
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
