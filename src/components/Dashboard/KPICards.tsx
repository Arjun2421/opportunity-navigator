import { Target, Trophy, XCircle, Clock, ThumbsDown, PlayCircle, Pause, Activity, FileCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCurrency } from '@/contexts/CurrencyContext';
import aedSymbol from '@/assets/aed-symbol.png';
import { KPIStats } from '@/services/dataCollection';

interface KPICardsProps {
  stats: KPIStats;
  onKPIClick?: (kpiType: string) => void;
}

export function KPICards({ stats, onKPIClick }: KPICardsProps) {
  const { currency, convertValue } = useCurrency();

  const formatCurrencyValue = (value: number) => {
    const converted = convertValue(value);
    if (currency === 'AED') {
      if (converted >= 1000000) return { symbol: 'aed', value: `${(converted / 1000000).toFixed(1)}M` };
      if (converted >= 1000) return { symbol: 'aed', value: `${(converted / 1000).toFixed(0)}K` };
      return { symbol: 'aed', value: converted.toFixed(0) };
    }
    if (converted >= 1000000) return { symbol: '$', value: `${(converted / 1000000).toFixed(1)}M` };
    if (converted >= 1000) return { symbol: '$', value: `${(converted / 1000).toFixed(0)}K` };
    return { symbol: '$', value: converted.toFixed(0) };
  };

  const CurrencyDisplay = ({ value }: { value: number }) => {
    const formatted = formatCurrencyValue(value);
    if (formatted.symbol === 'aed') {
      return (
        <span className="flex items-center gap-0.5">
          <img src={aedSymbol} alt="AED" className="h-4 w-4 inline-block dark:invert" />
          {formatted.value}
        </span>
      );
    }
    return <span>{formatted.symbol}{formatted.value}</span>;
  };

  const AedIcon = () => (
    <img src={aedSymbol} alt="AED" className="h-4 w-4 dark:invert" />
  );

  const DollarIcon = () => (
    <span className="text-sm font-bold">$</span>
  );

  const kpis = [
    { 
      label: 'Active Tenders', 
      displayValue: stats.activeTenders,
      Icon: Target, 
      color: 'text-primary', 
      bgColor: 'bg-primary/10', 
      type: 'active'
    },
    { 
      label: 'Total Active Value', 
      currencyValue: stats.totalActiveValue, 
      isCurrency: true,
      Icon: currency === 'AED' ? AedIcon : DollarIcon,
      color: 'text-info', 
      bgColor: 'bg-info/10', 
      type: 'pipeline'
    },
    { 
      label: 'Awarded', 
      currencyValue: stats.awardedValue, 
      displayValue: stats.awardedCount,
      isCurrency: true,
      showCount: true,
      Icon: Trophy, 
      color: 'text-success', 
      bgColor: 'bg-success/10', 
      type: 'awarded'
    },
    { 
      label: 'Lost', 
      currencyValue: stats.lostValue, 
      displayValue: stats.lostCount,
      isCurrency: true,
      showCount: true,
      Icon: XCircle, 
      color: 'text-destructive', 
      bgColor: 'bg-destructive/10', 
      type: 'lost'
    },
    { 
      label: 'Regretted', 
      currencyValue: stats.regrettedValue, 
      displayValue: stats.regrettedCount,
      isCurrency: true,
      showCount: true,
      Icon: ThumbsDown, 
      color: 'text-muted-foreground', 
      bgColor: 'bg-muted', 
      type: 'regretted'
    },
    { 
      label: 'Working', 
      currencyValue: stats.workingValue, 
      displayValue: stats.workingCount,
      isCurrency: true,
      showCount: true,
      Icon: Activity, 
      color: 'text-warning', 
      bgColor: 'bg-warning/10', 
      type: 'working'
    },
    { 
      label: 'To Start', 
      currencyValue: stats.toStartValue, 
      displayValue: stats.toStartCount,
      isCurrency: true,
      showCount: true,
      Icon: PlayCircle, 
      color: 'text-info', 
      bgColor: 'bg-info/10', 
      type: 'tostart'
    },
    { 
      label: 'Ongoing', 
      currencyValue: stats.ongoingValue, 
      displayValue: stats.ongoingCount,
      isCurrency: true,
      showCount: true,
      Icon: FileCheck, 
      color: 'text-pending', 
      bgColor: 'bg-pending/10', 
      type: 'ongoing'
    },
    { 
      label: 'Submission Near', 
      displayValue: stats.submissionNearCount,
      Icon: Clock, 
      color: 'text-destructive', 
      bgColor: 'bg-destructive/10', 
      type: 'submissionnear'
    },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
      {kpis.map((kpi, index) => (
        <Card 
          key={kpi.label} 
          className={`p-3 transition-all duration-300 hover:-translate-y-1 animate-fade-in ${onKPIClick ? 'cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-primary/20' : ''}`}
          style={{ animationDelay: `${index * 50}ms` }}
          onClick={() => onKPIClick?.(kpi.type)}
        >
          <div className="flex flex-col items-center text-center gap-2">
            <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
              <div className={`h-4 w-4 flex items-center justify-center ${kpi.color}`}>
                <kpi.Icon />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
              <p className={`text-sm font-bold ${kpi.color}`}>
                {kpi.isCurrency ? (
                  kpi.showCount ? (
                    <span className="flex flex-col items-center">
                      <span>{kpi.displayValue}</span>
                      <span className="text-xs opacity-80">
                        <CurrencyDisplay value={kpi.currencyValue!} />
                      </span>
                    </span>
                  ) : (
                    <CurrencyDisplay value={kpi.currencyValue!} />
                  )
                ) : (
                  kpi.displayValue
                )}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
