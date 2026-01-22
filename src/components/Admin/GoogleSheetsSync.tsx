import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, RefreshCw, Link2, Check, ArrowRight, AlertCircle, Table2 } from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

interface ColumnMapping {
  sheetColumn: string;
  dashboardField: string;
}

interface SheetConnection {
  apiKey: string;
  spreadsheetId: string;
  sheetName: string;
  mappings: ColumnMapping[];
  connectedAt: string;
}

const DASHBOARD_FIELDS = [
  { value: 'refNo', label: 'Reference No.' },
  { value: 'tenderName', label: 'Tender Name' },
  { value: 'tenderType', label: 'Type (EOI/Tender)' },
  { value: 'client', label: 'Client Name' },
  { value: 'lead', label: 'Internal Lead' },
  { value: 'value', label: 'Tender Value' },
  { value: 'avenirStatus', label: 'AVENIR STATUS' },
  { value: 'tenderResult', label: 'TENDER RESULT' },
  { value: 'tenderStatusRemark', label: 'TENDER STATUS (Remark)' },
  { value: 'remarksReason', label: 'REMARKS/REASON' },
  { value: 'year', label: 'Year' },
  { value: 'rawDateReceived', label: 'Date Tender Received' },
  { value: 'skip', label: '-- Skip this column --' },
];

export default function GoogleSheetsSync() {
  const [apiKey, setApiKey] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMappingDialog, setShowMappingDialog] = useState(false);
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [savedConnection, setSavedConnection] = useState<SheetConnection | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { refreshData } = useData();

  // Load saved connection on mount
  useEffect(() => {
    const saved = localStorage.getItem('gsheets_connection');
    if (saved) {
      try {
        const conn: SheetConnection = JSON.parse(saved);
        setSavedConnection(conn);
        setApiKey(conn.apiKey);
        setSpreadsheetId(conn.spreadsheetId);
        setSheetName(conn.sheetName);
        setColumnMappings(conn.mappings);
        setIsConnected(true);
      } catch {
        // ignore
      }
    }
  }, []);

  const extractSpreadsheetId = (input: string): string => {
    const urlMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch) return urlMatch[1];
    return input.trim();
  };

  const fetchSheetHeaders = async (): Promise<string[]> => {
    const id = extractSpreadsheetId(spreadsheetId);
    const range = sheetName ? `${sheetName}!A3:Z3` : 'Sheet1!A3:Z3';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${id}/values/${encodeURIComponent(range)}?key=${apiKey}`;

    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Failed to fetch headers (${res.status})`);
    }
    const data = await res.json();
    const headers: string[] = data.values?.[0] || [];
    return headers.filter((h: string) => h && h.trim() !== '');
  };

  const handleConnect = async () => {
    if (!apiKey || !spreadsheetId) {
      toast.error('Please enter API Key and Spreadsheet ID');
      return;
    }

    setIsLoading(true);
    setFetchError(null);

    try {
      const headers = await fetchSheetHeaders();
      if (headers.length === 0) {
        throw new Error('No column headers found in row 3');
      }
      setDetectedColumns(headers);
      // Auto-suggest mappings
      setColumnMappings(headers.map(col => {
        const suggestion = autoSuggestMapping(col);
        return { sheetColumn: col, dashboardField: suggestion };
      }));
      setShowMappingDialog(true);
    } catch (err: any) {
      console.error('Google Sheets connect error:', err);
      setFetchError(err.message || 'Failed to connect');
      toast.error(err.message || 'Failed to connect to Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const autoSuggestMapping = (colName: string): string => {
    const lower = colName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const hints: Record<string, string> = {
      'tenderno': 'refNo',
      'tendertype': 'tenderType',
      'type': 'tenderType',
      'client': 'client',
      'clientname': 'client',
      'tendername': 'tenderName',
      'name': 'tenderName',
      'lead': 'lead',
      'internallead': 'lead',
      'value': 'value',
      'tendervalue': 'value',
      'avenirstatus': 'avenirStatus',
      'tenderresult': 'tenderResult',
      'tenderstatus': 'tenderStatusRemark',
      'remarks': 'remarksReason',
      'remarksreason': 'remarksReason',
      'reason': 'remarksReason',
      'year': 'year',
      'datetenderrecd': 'rawDateReceived',
      'datereceived': 'rawDateReceived',
      'rfpreceived': 'rawDateReceived',
    };
    return hints[lower] || 'skip';
  };

  const handleMappingChange = (sheetColumn: string, dashboardField: string) => {
    setColumnMappings(prev =>
      prev.map(m =>
        m.sheetColumn === sheetColumn
          ? { ...m, dashboardField }
          : m
      )
    );
  };

  const handleApplyMapping = async () => {
    const mappedCount = columnMappings.filter(m => m.dashboardField !== 'skip').length;

    if (mappedCount === 0) {
      toast.error('Please map at least one column');
      return;
    }

    // Save connection
    const connection: SheetConnection = {
      apiKey,
      spreadsheetId: extractSpreadsheetId(spreadsheetId),
      sheetName,
      mappings: columnMappings,
      connectedAt: new Date().toISOString(),
    };
    localStorage.setItem('gsheets_connection', JSON.stringify(connection));
    setSavedConnection(connection);

    // Trigger data refresh which will use the dataCollection service
    setIsLoading(true);
    try {
      await refreshData();
      setShowMappingDialog(false);
      setIsConnected(true);
      toast.success(`Connected and synced data with ${mappedCount} mapped columns`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      await refreshData();
      toast.success('Data synced successfully');
    } catch (err: any) {
      console.error('Sync error:', err);
      setFetchError(err.message || 'Sync failed');
      toast.error(err.message || 'Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setApiKey('');
    setSpreadsheetId('');
    setSheetName('');
    setColumnMappings([]);
    setSavedConnection(null);
    localStorage.removeItem('gsheets_connection');
    toast.info('Disconnected from Google Sheets');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sheet className="h-5 w-5 text-success" />
            Google Sheets Sync
          </CardTitle>
          <CardDescription>
            Data is synced from Google Sheets automatically. Use the controls below to manage the connection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fetchError && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
            <Check className="h-5 w-5 text-success" />
            <div className="flex-1">
              <p className="text-sm font-medium text-success">Connected to Google Sheets</p>
              <p className="text-xs text-muted-foreground">
                Data syncs automatically from MASTER TENDER LIST AVENIR
              </p>
            </div>
            <Badge variant="outline" className="text-success border-success">
              Auto-sync enabled
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSync} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Now
            </Button>
            <Button variant="outline" onClick={() => setShowMappingDialog(true)}>
              <Table2 className="h-4 w-4 mr-2" />
              View Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Column Mapping Dialog */}
      <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5" />
              Google Sheets Connection Settings
            </DialogTitle>
            <DialogDescription>
              Configure how sheet columns map to dashboard fields
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Current Configuration</p>
              <p className="text-xs text-muted-foreground mt-1">
                Spreadsheet ID: 1DrnoJDytUd3_2uL5C3yyHT4yX4kleonTXaxiLgPCYK4
              </p>
              <p className="text-xs text-muted-foreground">
                Sheet Name: MASTER TENDER LIST AVENIR
              </p>
              <p className="text-xs text-muted-foreground">
                Data starts from Row 4, Column B
              </p>
            </div>

            {detectedColumns.length > 0 && (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {detectedColumns.map((column, index) => (
                    <div key={column} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{column}</p>
                        <p className="text-xs text-muted-foreground">Column {String.fromCharCode(66 + index)}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <Select
                        value={columnMappings.find(m => m.sheetColumn === column)?.dashboardField || 'skip'}
                        onValueChange={(value) => handleMappingChange(column, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {DASHBOARD_FIELDS.map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
              Close
            </Button>
            {detectedColumns.length > 0 && (
              <Button onClick={handleApplyMapping} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Apply & Sync
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
