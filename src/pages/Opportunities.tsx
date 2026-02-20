import { useState, useMemo } from 'react';
import { OpportunitiesTable } from '@/components/Dashboard/OpportunitiesTable';
import { ExportButton } from '@/components/Dashboard/ExportButton';
import { TenderDetailSheet } from '@/components/Dashboard/TenderDetailSheet';
import { TenderData } from '@/services/dataCollection';
import { useData } from '@/contexts/DataContext';

interface OpportunitiesProps {
  statusFilter?: string;
}

const Opportunities = ({ statusFilter }: OpportunitiesProps) => {
  const { tenders } = useData();
  const [selectedTender, setSelectedTender] = useState<TenderData | null>(null);

  const filteredData = useMemo(() => {
    if (!statusFilter) return tenders;
    return tenders.filter(t => 
      t.avenirStatus?.toUpperCase() === statusFilter.toUpperCase()
    );
  }, [tenders, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {statusFilter ? `${statusFilter} Tenders` : 'All Tenders'}
          </h1>
          <p className="text-muted-foreground">
            {filteredData.length} tenders found
          </p>
        </div>
        <ExportButton data={filteredData} filename={statusFilter ? `${statusFilter.toLowerCase().replace(/\//g, '-')}-tenders` : 'all-tenders'} />
      </div>

      <OpportunitiesTable data={filteredData} onSelectTender={setSelectedTender} />

      <TenderDetailSheet tender={selectedTender} onClose={() => setSelectedTender(null)} />
    </div>
  );
};

export default Opportunities;
