import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Building2 } from 'lucide-react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { ClientData } from '@/services/dataCollection';

interface ClientLeaderboardProps {
  data: ClientData[];
  onClientClick?: (client: string) => void;
}

export function ClientLeaderboard({ data, onClientClick }: ClientLeaderboardProps) {
  const { formatCurrency } = useCurrency();
  const topClients = data.slice(0, 8);
  const maxValue = Math.max(...topClients.map(c => c.value), 1);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          Top Clients by Value
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topClients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No clients found
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
                  <span className="text-xs font-mono text-muted-foreground w-5">
                    {index + 1}
                  </span>
                  <span className="font-medium truncate max-w-[120px]" title={client.name}>
                    {client.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <span className="text-xs text-muted-foreground">{client.count} opps</span>
                  <span className="font-semibold">{formatCurrency(client.value)}</span>
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
