import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FunnelData } from '@/services/dataCollection';

interface FunnelChartProps {
  data: FunnelData[];
  onStageClick?: (stage: string) => void;
}

export function FunnelChart({ data, onStageClick }: FunnelChartProps) {
  const { formatCurrency } = useCurrency();
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const colors = ['bg-info', 'bg-warning', 'bg-pending', 'bg-success', 'bg-destructive', 'bg-muted'];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pipeline data available
          </p>
        ) : (
          data.map((item, index) => {
            const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
            return (
              <div
                key={item.stage}
                className={`space-y-1 ${onStageClick ? 'cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors' : ''}`}
                onClick={() => onStageClick?.(item.stage)}
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.stage}</span>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{item.count} opps</span>
                    <span>{formatCurrency(item.value)}</span>
                    {index > 0 && (
                      <span className="text-xs text-primary font-medium">{item.conversionRate}%</span>
                    )}
                  </div>
                </div>
                <div className="h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colors[index % colors.length]} transition-all duration-500 flex items-center justify-end pr-2`}
                    style={{ width: `${Math.max(width, 5)}%` }}
                  >
                    {item.count > 0 && (
                      <span className="text-xs font-bold text-white">{item.count}</span>
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
