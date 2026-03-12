import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as XLSX from 'xlsx';
import { getVendors, saveVendors, VendorData } from '@/data/vendorData';
import { toast } from '@/hooks/use-toast';

interface ImportVendorsDialogProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

function normalizeName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ')
    .replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

const split = (v: string): string[] =>
  v ? v.split(/,\s*/).map(s => s.trim()).filter(Boolean) : [];

export function ImportVendorsDialog({ open, onClose, onImported }: ImportVendorsDialogProps) {
  const [preview, setPreview] = useState<VendorData[]>([]);
  const [dupeCount, setDupeCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const headers = [
      'Company Name', 'Focus Area', 'Agreement Status', 'Agreement Documents',
      'Company Size', 'Contact Person', 'Emails',
      'Primary Industries', 'Confirmed Services', 'Confirmed Tech Stack',
      'Non-Specialized Tech', 'Sample Projects', 'Certifications', 'Partners', 'Sources'
    ];
    const sample = [
      'Example Corp', 'AI / Cloud', 'NDA', 'Available',
      '51-200 employees', 'John Doe', 'john@example.com, jane@example.com',
      'Healthcare, BFSI', 'AI Development, Cloud Migration', 'Python, React, AWS',
      'Hardware Design', 'Project A, Project B', 'ISO 27001', 'AWS, Microsoft', 'https://example.com'
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, sample]);
    ws['!cols'] = headers.map(() => ({ wch: 25 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
    XLSX.writeFile(wb, 'vendor-import-template.xlsx');
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      const existing = getVendors();
      const existingNames = new Set(existing.map(v => normalizeName(v.companyName)));
      let dupes = 0;

      const newVendors: VendorData[] = [];

      rows.forEach((row) => {
        const rawName = String(row['Company Name'] || '').trim();
        if (!rawName) return;

        const name = normalizeName(rawName);
        if (existingNames.has(name)) {
          dupes++;
          return;
        }
        existingNames.add(name);

        newVendors.push({
          id: `vendor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          companyName: name,
          focusArea: String(row['Focus Area'] || '').trim(),
          agreementStatus: String(row['Agreement Status'] || '').trim(),
          agreementDocuments: String(row['Agreement Documents'] || '').trim(),
          companySize: String(row['Company Size'] || '').trim(),
          contactPerson: String(row['Contact Person'] || '').trim(),
          emails: split(String(row['Emails'] || '')),
          primaryIndustries: split(String(row['Primary Industries'] || '')),
          confirmedServices: split(String(row['Confirmed Services'] || '')),
          confirmedTechStack: split(String(row['Confirmed Tech Stack'] || '')),
          nonSpecializedTechStack: split(String(row['Non-Specialized Tech'] || '')),
          sampleProjects: split(String(row['Sample Projects'] || '')),
          certifications: split(String(row['Certifications'] || '')),
          partners: split(String(row['Partners'] || '')),
          sources: split(String(row['Sources'] || '')),
        });
      });

      setPreview(newVendors);
      setDupeCount(dupes);
    };
    reader.readAsBinaryString(file);
  };

  const confirmImport = () => {
    if (!preview.length) return;
    const existing = getVendors();
    saveVendors([...existing, ...preview]);
    toast({ title: `${preview.length} vendor(s) imported` });
    setPreview([]);
    setDupeCount(0);
    onImported();
    onClose();
  };

  const reset = () => {
    setPreview([]);
    setDupeCount(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={() => { reset(); onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Import Vendors from Excel
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={downloadTemplate}>
            <Download className="h-4 w-4" /> Download Template
          </Button>

          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">Upload your filled Excel file</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="text-sm" />
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-medium">{preview.length} new vendor(s) ready</span>
              </div>
              {dupeCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="text-sm text-muted-foreground">{dupeCount} duplicate(s) skipped</span>
                </div>
              )}
              <ScrollArea className="max-h-40 border rounded-lg p-2">
                {preview.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 py-1 text-sm">
                    <Badge variant="outline" className="text-[10px]">{v.agreementStatus || 'N/A'}</Badge>
                    <span className="font-medium">{v.companyName}</span>
                    <span className="text-muted-foreground text-xs">— {v.focusArea}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Cancel</Button>
          <Button onClick={confirmImport} disabled={!preview.length}>Import {preview.length} Vendor(s)</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
