import { Target, Trophy, XCircle, Clock, ThumbsDown, Zap, Play, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useCurrency } from '@/contexts/CurrencyContext';
import aedSymbol from '@/assets/aed-symbol.png';
import { KPIStats } from '@/services/dataCollection';

type KPIType = 'active' | 'awarded' | 'lost' | 'regretted' | 'working' | 'tostart' | 'ongoing' | 'submission';

interface KPICardsProps {
  stats: KPIStats;
  activeKPI?: KPIType | null;
  onKPIClick?: (kpiType: KPIType) => void;
}

export function KPICards({ stats, activeKPI, onKPIClick }: KPICardsProps) {
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

  const kpis: Array<{
    label: string;
    displayValue?: number;
    currencyValue?: number;
    isCurrency?: boolean;
    Icon: any;
    color: string;
    bgColor: string;
    type: KPIType;
  }> = [
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
      type: 'awarded'
    },
    { 
      label: 'Awarded', 
      displayValue: stats.awardedCount,
      Icon: Trophy, 
      color: 'text-success', 
      bgColor: 'bg-success/10', 
      type: 'awarded'
    },
    { 
      label: 'Lost', 
      displayValue: stats.lostCount,
      Icon: XCircle, 
      color: 'text-destructive', 
      bgColor: 'bg-destructive/10', 
      type: 'lost'
    },
    { 
      label: 'Regretted', 
      displayValue: stats.regrettedCount,
      Icon: ThumbsDown, 
      color: 'text-muted-foreground', 
      bgColor: 'bg-muted', 
      type: 'regretted'
    },
    { 
      label: 'Working', 
      displayValue: stats.workingCount,
      Icon: Zap, 
      color: 'text-warning', 
      bgColor: 'bg-warning/10', 
      type: 'working'
    },
    { 
      label: 'To Start', 
      displayValue: stats.toStartCount,
      Icon: Play, 
      color: 'text-pending', 
      bgColor: 'bg-pending/10', 
      type: 'tostart'
    },
    { 
      label: 'Ongoing', 
      displayValue: stats.ongoingCount,
      Icon: CheckCircle, 
      color: 'text-info', 
      bgColor: 'bg-info/10', 
      type: 'ongoing'
    },
    { 
      label: 'Submission Near', 
      displayValue: stats.submissionNearCount,
      Icon: AlertTriangle, 
      color: 'text-destructive', 
      bgColor: 'bg-destructive/10', 
      type: 'submission'
    },
  ];

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
      {kpis.map((kpi, index) => {
        const isActive = activeKPI === kpi.type;
        return (
          <Card 
            key={kpi.label} 
            className={`p-3 transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer hover:shadow-lg ${
              isActive ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'hover:ring-2 hover:ring-primary/20'
            }`}
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
                    <CurrencyDisplay value={kpi.currencyValue!} />
                  ) : (
                    kpi.displayValue
                  )}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
