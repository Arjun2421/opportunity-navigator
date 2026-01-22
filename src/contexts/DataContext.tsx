import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { 
  TenderData, 
  KPIStats, 
  FunnelData, 
  ClientData,
  fetchGoogleSheetsData, 
  calculateKPIStats, 
  calculateFunnelData, 
  getClientData,
  getSubmissionNearTenders,
  convertToOpportunityFormat 
} from '@/services/dataCollection';

interface DataContextType {
  tenders: TenderData[];
  opportunities: any[]; // Legacy format for compatibility
  kpiStats: KPIStats;
  funnelData: FunnelData[];
  clientData: ClientData[];
  submissionNearTenders: TenderData[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  clearAllData: () => void;
  isDataCleared: boolean;
}

const defaultKPIStats: KPIStats = {
  activeTenders: 0,
  totalActiveValue: 0,
  awardedCount: 0,
  awardedValue: 0,
  lostCount: 0,
  lostValue: 0,
  regrettedCount: 0,
  regrettedValue: 0,
  workingCount: 0,
  workingValue: 0,
  toStartCount: 0,
  toStartValue: 0,
  ongoingCount: 0,
  ongoingValue: 0,
  submissionNearCount: 0,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tenders, setTenders] = useState<TenderData[]>([]);
  const [kpiStats, setKpiStats] = useState<KPIStats>(defaultKPIStats);
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [clientData, setClientData] = useState<ClientData[]>([]);
  const [submissionNearTenders, setSubmissionNearTenders] = useState<TenderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDataCleared, setIsDataCleared] = useState(false);

  // Convert tenders to legacy opportunity format
  const opportunities = tenders.map(convertToOpportunityFormat);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchGoogleSheetsData();
      setTenders(data);
      setKpiStats(calculateKPIStats(data));
      setFunnelData(calculateFunnelData(data));
      setClientData(getClientData(data));
      setSubmissionNearTenders(getSubmissionNearTenders(data));
      setIsDataCleared(false);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAllData = useCallback(() => {
    setTenders([]);
    setKpiStats(defaultKPIStats);
    setFunnelData([]);
    setClientData([]);
    setSubmissionNearTenders([]);
    setIsDataCleared(true);
    localStorage.removeItem('approvals');
    localStorage.removeItem('syncLogs');
  }, []);

  // Fetch data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <DataContext.Provider value={{ 
      tenders, 
      opportunities,
      kpiStats, 
      funnelData, 
      clientData,
      submissionNearTenders,
      isLoading, 
      error, 
      refreshData,
      clearAllData,
      isDataCleared 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
