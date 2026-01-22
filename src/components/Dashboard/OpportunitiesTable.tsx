import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertTriangle, Search, CheckCircle, Clock, RotateCcw, RefreshCw, MessageSquare } from 'lucide-react';
import { TenderData } from '@/services/dataCollection';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useApproval } from '@/contexts/ApprovalContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface OpportunitiesTableProps {
  data: TenderData[];
  onSelectTender?: (tender: TenderData) => void;
}

const AVENIR_STATUS_OPTIONS = ['ALL', 'HOLD / CLOSED', 'REGRETTED', 'SUBMITTED', 'AWARDED', 'TO START', 'WORKING'];

export function OpportunitiesTable({ data, onSelectTender }: OpportunitiesTableProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const { formatCurrency } = useCurrency();
  const { getApprovalStatus, approveOpportunity, revertApproval, refreshApprovals } = useApproval();
  const { isAdmin, isMaster, user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshApprovals();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredData = data.filter(tender => {
    const matchesSearch = !search || 
      tender.tenderName?.toLowerCase().includes(search.toLowerCase()) ||
      tender.client?.toLowerCase().includes(search.toLowerCase()) ||
      tender.refNo?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
      tender.avenirStatus?.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const upperStatus = status?.toUpperCase() || '';
    const variants: Record<string, string> = {
      'TO START': 'bg-info/20 text-info',
      'WORKING': 'bg-warning/20 text-warning',
      'ONGOING': 'bg-warning/20 text-warning',
      'SUBMITTED': 'bg-pending/20 text-pending',
      'AWARDED': 'bg-success/20 text-success',
      'LOST': 'bg-destructive/20 text-destructive',
      'REGRETTED': 'bg-muted text-muted-foreground',
      'HOLD / CLOSED': 'bg-muted text-muted-foreground',
    };
    return variants[upperStatus] || 'bg-muted text-muted-foreground';
  };

  const getTenderResultBadge = (result: string) => {
    const upperResult = result?.toUpperCase() || '';
    const variants: Record<string, string> = {
      'ONGOING': 'bg-warning/20 text-warning',
      'AWARDED': 'bg-success/20 text-success',
    };
    return variants[upperResult] || 'bg-muted/50 text-muted-foreground';
  };

  const handleApprovalChange = (tenderId: string, value: string) => {
    if (!user) return;
    if (value === 'approved') {
      approveOpportunity(tenderId, user.displayName, user.role);
    }
  };

  const handleRevertApproval = (tenderId: string) => {
    if (!user || !isMaster) return;
    revertApproval(tenderId, user.displayName, user.role);
  };

  return (
    <Card className="flex-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Tenders</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 w-48 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {AVENIR_STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="h-9 px-3"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh approval status</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-auto scrollbar-thin">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-24">Ref No.</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="font-bold">RFP Received</TableHead>
                <TableHead>Lead</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>AVENIR STATUS</TableHead>
                <TableHead>TENDER RESULT</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="w-16">Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.slice(0, 50).map((tender) => {
                const approvalStatus = getApprovalStatus(tender.id);
                return (
                  <TableRow 
                    key={tender.id} 
                    className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => onSelectTender?.(tender)}
                  >
                    <TableCell className="font-mono text-xs">{tender.refNo || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {tender.tenderType || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[120px] truncate">{tender.client || '—'}</TableCell>
                    <TableCell className="font-bold text-sm">
                      {tender.rfpReceivedDate || <span className="text-muted-foreground font-normal">—</span>}
                    </TableCell>
                    <TableCell>{tender.lead || <span className="text-muted-foreground text-xs">Unassigned</span>}</TableCell>
                    <TableCell className="text-right font-mono">
                      {tender.value > 0 ? formatCurrency(tender.value) : '—'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(tender.avenirStatus)}>
                        {tender.avenirStatus || '—'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tender.tenderResult ? (
                        <Badge className={getTenderResultBadge(tender.tenderResult)}>
                          {tender.tenderResult}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {approvalStatus === 'approved' ? (
                        <div className="flex items-center gap-1">
                          <Badge className="bg-success/20 text-success gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </Badge>
                          {isMaster && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => handleRevertApproval(tender.id)}
                                >
                                  <RotateCcw className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Revert to Pending (Master only)</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      ) : isAdmin ? (
                        <Select
                          value={approvalStatus}
                          onValueChange={(value) => handleApprovalChange(tender.id, value)}
                        >
                          <SelectTrigger className="h-7 w-[100px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Pending
                              </span>
                            </SelectItem>
                            <SelectItem value="approved">
                              <span className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Approved
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {(tender.tenderStatusRemark || tender.remarksReason) && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-2">
                              {tender.tenderStatusRemark && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Tender Status</p>
                                  <p className="text-sm">{tender.tenderStatusRemark}</p>
                                </div>
                              )}
                              {tender.remarksReason && (
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground">Remarks/Reason</p>
                                  <p className="text-sm">{tender.remarksReason}</p>
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                      {tender.isSubmissionNear && (
                        <Tooltip>
                          <TooltipTrigger>
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          </TooltipTrigger>
                          <TooltipContent>Submission Near (within 7 days of received)</TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="p-3 text-xs text-muted-foreground border-t">
          Showing {Math.min(filteredData.length, 50)} of {filteredData.length} tenders
        </div>
      </CardContent>
    </Card>
  );
}
