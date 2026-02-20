import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TenderData } from '@/services/dataCollection';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TenderDetailSheetProps {
  tender: TenderData | null;
  onClose: () => void;
}

export function TenderDetailSheet({ tender, onClose }: TenderDetailSheetProps) {
  const { formatCurrency } = useCurrency();

  return (
    <Sheet open={!!tender} onOpenChange={() => onClose()}>
      <SheetContent className="w-[450px] sm:max-w-[450px] overflow-auto">
        {tender && (
          <>
            <SheetHeader>
              <SheetTitle className="text-left">{tender.refNo}</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{tender.tenderName || 'Unnamed Tender'}</h3>
                <p className="text-sm text-muted-foreground">{tender.client}</p>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge>{tender.avenirStatus}</Badge>
                {tender.tenderResult && (
                  <Badge variant="outline">{tender.tenderResult}</Badge>
                )}
                {tender.isSubmissionNear && (
                  <Badge variant="destructive">Submission Near</Badge>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-semibold">{tender.tenderType || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <p className="font-semibold">
                    {tender.value > 0 ? formatCurrency(tender.value) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">RFP Received</p>
                  <p className="font-semibold">{tender.rfpReceivedDate || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lead</p>
                  <p className="font-semibold">{tender.lead || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Group</p>
                  <p className="font-semibold">{tender.groupClassification || '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Year</p>
                  <p className="font-semibold">{tender.year || '—'}</p>
                </div>
              </div>

              {(tender.tenderStatusRemark || tender.remarksReason) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    {tender.tenderStatusRemark && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Tender Status Remark</p>
                        <p className="text-sm bg-muted/50 p-2 rounded">{tender.tenderStatusRemark}</p>
                      </div>
                    )}
                    {tender.remarksReason && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Remarks/Reason</p>
                        <p className="text-sm bg-muted/50 p-2 rounded">{tender.remarksReason}</p>
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
  );
}
