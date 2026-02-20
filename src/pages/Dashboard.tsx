import { useState, useMemo, useCallback } from 'react';
import { KPICards } from '@/components/Dashboard/KPICards';
import { FunnelChart } from '@/components/Dashboard/FunnelChart';
import { OpportunitiesTable } from '@/components/Dashboard/OpportunitiesTable';
import { AtRiskWidget } from '@/components/Dashboard/AtRiskWidget';
import { ClientLeaderboard } from '@/components/Dashboard/ClientLeaderboard';
import { ExportButton } from '@/components/Dashboard/ExportButton';
import { AdvancedFilters, FilterState, defaultFilters, applyFilters } from '@/components/Dashboard/AdvancedFilters';
import { TenderDetailSheet } from '@/components/Dashboard/TenderDetailSheet';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { TenderData, calculateKPIStats, calculateFunnelData, getClientData, getSubmissionNearTenders } from '@/services/dataCollection';
import { useData } from '@/contexts/DataContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

type KPIType = 'active' | 'awarded' | 'lost' | 'regretted' | 'working' | 'tostart' | 'ongoing' | 'submission';

const KPI_TO_STATUSES: Record<KPIType, string[]> = {
  active: ['WORKING', 'ONGOING', 'SUBMITTED', 'AWARDED'],
  awarded: ['AWARDED'],
  lost: ['LOST'],
  regretted: ['REGRETTED'],
  working: ['WORKING'],
  tostart: ['TO START'],
  ongoing: ['ONGOING'],
  submission: [],
};

const Dashboard = () => {
  const { tenders, isLoading, error, refreshData } = useData();
  const [selectedTender, setSelectedTender] = useState<TenderData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeKPI, setActiveKPI] = useState<KPIType | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleKPIClick = useCallback((kpiType: KPIType) => {
    if (activeKPI === kpiType) {
      setActiveKPI(null);
      setFilters(prev => ({ ...prev, statuses: [], showSubmissionNear: false }));
    } else {
      setActiveKPI(kpiType);
      if (kpiType === 'submission') {
        setFilters(prev => ({ ...prev, statuses: [], showSubmissionNear: true }));
      } else {
        setFilters(prev => ({ ...prev, statuses: KPI_TO_STATUSES[kpiType], showSubmissionNear: false }));
      }
    }
  }, [activeKPI]);

  const handleStageClick = useCallback((stage: string) => {
    setFilters(prev => {
      const hasStatus = prev.statuses.includes(stage);
      return {
        ...prev,
        statuses: hasStatus
          ? prev.statuses.filter(s => s !== stage)
          : [...prev.statuses, stage],
      };
    });
    setActiveKPI(null);
  }, []);

  const handleClientClick = useCallback((clientName: string) => {
    setFilters(prev => {
      const hasClient = prev.clients.includes(clientName);
      return {
        ...prev,
        clients: hasClient
          ? prev.clients.filter(c => c !== clientName)
          : [...prev.clients, clientName],
      };
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setActiveKPI(null);
  }, []);

  const filteredTenders = useMemo(() => applyFilters(tenders, filters), [tenders, filters]);
  const kpiStats = useMemo(() => calculateKPIStats(filteredTenders), [filteredTenders]);
  const funnelData = useMemo(() => calculateFunnelData(filteredTenders), [filteredTenders]);
  const clientData = useMemo(() => getClientData(filteredTenders), [filteredTenders]);
  const submissionNearTenders = useMemo(() => getSubmissionNearTenders(filteredTenders), [filteredTenders]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load data: {error}
            <Button variant="outline" size="sm" className="ml-4" onClick={handleRefresh}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {filteredTenders.length} of {tenders.length} tenders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <ExportButton data={filteredTenders} filename="tenders" />
        </div>
      </div>

      <KPICards stats={kpiStats} activeKPI={activeKPI} onKPIClick={handleKPIClick} />

      <AdvancedFilters
        data={tenders}
        filters={filters}
        onFiltersChange={(f) => { setFilters(f); setActiveKPI(null); }}
        onClearFilters={handleClearFilters}
      />

      <OpportunitiesTable data={filteredTenders} onSelectTender={setSelectedTender} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FunnelChart data={funnelData} onStageClick={handleStageClick} />
        <AtRiskWidget data={submissionNearTenders} onSelectTender={setSelectedTender} />
        <ClientLeaderboard data={clientData} onClientClick={handleClientClick} />
      </div>

      <TenderDetailSheet tender={selectedTender} onClose={() => setSelectedTender(null)} />
    </div>
  );
};

export default Dashboard;
