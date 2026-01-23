import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TenderData } from '@/services/dataCollection';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useApproval } from '@/contexts/ApprovalContext';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  data: TenderData[];
  filename?: string;
}

export function ExportButton({ data, filename = 'tenders' }: ExportButtonProps) {
  const { currency, convertValue } = useCurrency();
  const { getApprovalStatus } = useApproval();

  const handleExport = () => {
    const currencySymbol = currency === 'AED' ? 'AED' : 'USD';
    
    const exportData = data.map((tender) => ({
      'Ref No': tender.refNo,
      'Tender Name': tender.tenderName,
      'Client': tender.client,
      'Type': tender.tenderType,
      'Lead': tender.lead || 'Unassigned',
      [`Value (${currencySymbol})`]: Math.round(convertValue(tender.value)),
      'RFP Received': tender.rfpReceivedDate || '',
      'AVENIR STATUS': tender.avenirStatus,
      'TENDER RESULT': tender.tenderResult || '',
      'Submission Near': tender.isSubmissionNear ? 'Yes' : 'No',
      'Approval Status': getApprovalStatus(tender.refNo) === 'approved' ? 'Approved' : 'Pending',
      'Tender Status Remark': tender.tenderStatusRemark || '',
      'Remarks/Reason': tender.remarksReason || '',
    }));

    if (exportData.length === 0) {
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tenders');

    // Auto-size columns
    const maxWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(
        key.length,
        ...exportData.map((row) => String(row[key as keyof typeof row] || '').length)
      ),
    }));
    worksheet['!cols'] = maxWidths;

    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
      <Download className="h-4 w-4" />
      Export Excel
    </Button>
  );
}
