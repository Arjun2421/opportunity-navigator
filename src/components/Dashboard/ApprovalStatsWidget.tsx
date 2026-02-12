import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useApproval } from "@/contexts/ApprovalContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { TenderData } from "@/services/dataCollection";

interface ApprovalStatsWidgetProps {
  data: TenderData[];
}

export function ApprovalStatsWidget({ data }: ApprovalStatsWidgetProps) {
  const { getApprovalStatus } = useApproval();
  const { formatCurrency } = useCurrency();

  const stats = useMemo(() => {
    let fullyApproved = 0;
    let phApproved = 0;
    let pending = 0;
    let fullyApprovedValue = 0;
    let phApprovedValue = 0;
    let pendingValue = 0;

    for (const t of data) {
      const status = getApprovalStatus(t.id);
      if (status === "fully_approved") {
        fullyApproved++;
        fullyApprovedValue += t.value || 0;
      } else if (status === "proposal_head_approved") {
        phApproved++;
        phApprovedValue += t.value || 0;
      } else {
        pending++;
        pendingValue += t.value || 0;
      }
    }

    const total = fullyApproved + phApproved + pending;
    const approvedPct = total === 0 ? 0 : Math.round((fullyApproved / total) * 100);

    return { fullyApproved, phApproved, pending, fullyApprovedValue, phApprovedValue, pendingValue, total, approvedPct };
  }, [data, getApprovalStatus]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Approval Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Fully Approved</span>
            </div>
            <Badge variant="outline" className="border-success text-success">
              {stats.fullyApproved}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Value: <span className="font-medium text-foreground">{formatCurrency(stats.fullyApprovedValue)}</span>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4 text-info" />
              <span className="text-sm font-medium">PH Approved (Awaiting SVP)</span>
            </div>
            <Badge variant="outline" className="border-info text-info">
              {stats.phApproved}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Value: <span className="font-medium text-foreground">{formatCurrency(stats.phApprovedValue)}</span>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-pending" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <Badge variant="secondary">{stats.pending}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Value: <span className="font-medium text-foreground">{formatCurrency(stats.pendingValue)}</span>
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Fully approved</span>
            <span>{stats.approvedPct}%</span>
          </div>
          <Progress value={stats.approvedPct} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
