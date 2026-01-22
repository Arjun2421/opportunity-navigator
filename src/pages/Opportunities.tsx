import { useState, useMemo } from 'react';
import { OpportunitiesTable } from '@/components/Dashboard/OpportunitiesTable';
import { ExportButton } from '@/components/Dashboard/ExportButton';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TenderData } from '@/services/dataCollection';
import { useData } from '@/contexts/DataContext';
import { useCurrency } from '@/contexts/CurrencyContext';

interface OpportunitiesProps {
  statusFilter?: string;
}

const Opportunities = ({ statusFilter }: OpportunitiesProps) => {
  const { tenders } = useData();
  const { formatCurrency } = useCurrency();
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
                  {selectedTender.isSubmissionNear && <Badge variant="destructive">Submission Near</Badge>}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Value</p>
                    <p className="font-semibold">
                      {selectedTender.value > 0 ? formatCurrency(selectedTender.value) : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-semibold">{selectedTender.tenderType || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">RFP Received</p>
                    <p className="font-semibold">{selectedTender.rfpReceivedDate || '—'}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Internal Lead</p>
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

export default Opportunities;
