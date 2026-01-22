import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCurrency } from '@/contexts/CurrencyContext';
import { FunnelData } from '@/services/dataCollection';

interface FunnelChartProps {
  data: FunnelData[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const { formatCurrency } = useCurrency();
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const colors = [
    'bg-info',
    'bg-warning', 
    'bg-pending',
    'bg-success',
  ];

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
          data.map((stage, index) => (
            <div key={stage.stage} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{stage.stage}</span>
                <span className="text-muted-foreground">
                  {stage.count} ({formatCurrency(stage.value)})
                </span>
              </div>
              <div className="h-6 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors[index % colors.length]} transition-all duration-500 flex items-center justify-end pr-2`}
                  style={{ width: `${Math.max((stage.count / maxCount) * 100, 5)}%` }}
                >
                  {stage.count > 0 && (
                    <span className="text-xs font-bold text-white">{stage.count}</span>
                  )}
                </div>
              </div>
              {index < data.length - 1 && (
                <div className="text-xs text-muted-foreground text-right">
                  {stage.conversionRate}% →
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
