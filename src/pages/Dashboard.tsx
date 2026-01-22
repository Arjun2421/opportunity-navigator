import { useState } from 'react';
import { KPICards } from '@/components/Dashboard/KPICards';
import { FunnelChart } from '@/components/Dashboard/FunnelChart';
import { OpportunitiesTable } from '@/components/Dashboard/OpportunitiesTable';
import { AtRiskWidget } from '@/components/Dashboard/AtRiskWidget';
import { ClientLeaderboard } from '@/components/Dashboard/ClientLeaderboard';
import { ExportButton } from '@/components/Dashboard/ExportButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { TenderData } from '@/services/dataCollection';
import { useData } from '@/contexts/DataContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { 
    tenders, 
    kpiStats, 
    funnelData, 
    clientData, 
    submissionNearTenders,
    isLoading, 
    error, 
    refreshData 
  } = useData();
  const { formatCurrency } = useCurrency();
  const [selectedTender, setSelectedTender] = useState<TenderData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleKPIClick = (kpiType: string) => {
    // Could implement filtering based on KPI type
    console.log('KPI clicked:', kpiType);
  };

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
            Failed to load data from Google Sheets: {error}
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
      {/* Header with Refresh and Export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {tenders.length} tenders loaded from Google Sheets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
          <ExportButton data={tenders} filename="tenders" />
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards stats={kpiStats} onKPIClick={handleKPIClick} />

      {/* Tenders Table - Now above other widgets */}
      <OpportunitiesTable data={tenders} onSelectTender={setSelectedTender} />

      {/* Secondary Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel */}
        <FunnelChart data={funnelData} />
        
        {/* Submission Near Widget */}
        <AtRiskWidget data={submissionNearTenders} />
        
        {/* Client Leaderboard */}
        <ClientLeaderboard data={clientData} />
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedTender} onOpenChange={() => setSelectedTender(null)}>
        <SheetContent className="w-[450px] sm:max-w-[450px] overflow-auto">
          {selectedTender && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{selectedTender.refNo}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTender.tenderName || 'Unnamed Tender'}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTender.client}</p>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Badge>{selectedTender.avenirStatus}</Badge>
                  {selectedTender.tenderResult && (
                    <Badge variant="outline">{selectedTender.tenderResult}</Badge>
                  )}
                  {selectedTender.isSubmissionNear && (
                    <Badge variant="destructive">Submission Near</Badge>
                  )}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-semibold">{selectedTender.tenderType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-semibold">
                      {selectedTender.value > 0 ? formatCurrency(selectedTender.value) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RFP Received</p>
                    <p className="font-semibold">{selectedTender.rfpReceivedDate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Lead</p>
                    <p className="font-semibold">{selectedTender.lead || 'Unassigned'}</p>
                  </div>
                </div>

                {(selectedTender.tenderStatusRemark || selectedTender.remarksReason) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      {selectedTender.tenderStatusRemark && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Tender Status Remark</p>
                          <p className="text-sm bg-muted/50 p-2 rounded">{selectedTender.tenderStatusRemark}</p>
                        </div>
                      )}
                      {selectedTender.remarksReason && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Remarks/Reason</p>
                          <p className="text-sm bg-muted/50 p-2 rounded">{selectedTender.remarksReason}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Dashboard;
