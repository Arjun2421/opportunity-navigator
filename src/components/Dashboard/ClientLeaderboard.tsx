import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ClientData } from '@/services/dataCollection';

interface ClientLeaderboardProps {
  data: ClientData[];
  onClientClick?: (client: string) => void;
}

export function ClientLeaderboard({ data, onClientClick }: ClientLeaderboardProps) {
  const { formatCurrency } = useCurrency();
  const maxValue = data[0]?.value || 1;
  const topClients = data.slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Top Clients</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topClients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No client data available
          </p>
        ) : (
          topClients.map((client, index) => (
            <div
              key={client.name}
              className={`space-y-1 ${onClientClick ? 'cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors' : ''}`}
              onClick={() => onClientClick?.(client.name)}
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-4">{index + 1}.</span>
                  <span className="font-medium truncate max-w-[120px]" title={client.name}>
                    {client.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-semibold">{formatCurrency(client.value)}</span>
                  <span className="text-xs text-muted-foreground ml-1">({client.count})</span>
                </div>
              </div>
              <Progress value={(client.value / maxValue) * 100} className="h-1.5" />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
