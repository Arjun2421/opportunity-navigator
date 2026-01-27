import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Pencil, 
  Check, 
  X, 
  GripVertical,
  RotateCcw,
  Save,
  Table2
} from 'lucide-react';
import { toast } from 'sonner';
import { useData } from '@/contexts/DataContext';

interface FieldMapping {
  id: string;
  sourceColumn: string;
  displayName: string;
  isVisible: boolean;
  order: number;
}

// Default field mappings based on dataCollection.ts
const DEFAULT_MAPPINGS: FieldMapping[] = [
  { id: 'refNo', sourceColumn: 'TENDER NO', displayName: 'Ref No.', isVisible: true, order: 0 },
  { id: 'tenderType', sourceColumn: 'TENDER TYPE', displayName: 'Type', isVisible: true, order: 1 },
  { id: 'client', sourceColumn: 'CLIENT', displayName: 'Client', isVisible: true, order: 2 },
  { id: 'tenderName', sourceColumn: 'TENDER NAME', displayName: 'Tender Name', isVisible: true, order: 3 },
  { id: 'lead', sourceColumn: 'LEAD', displayName: 'Lead', isVisible: true, order: 4 },
  { id: 'value', sourceColumn: 'TENDER VALUE', displayName: 'Value', isVisible: true, order: 5 },
  { id: 'year', sourceColumn: 'YEAR', displayName: 'Year', isVisible: false, order: 6 },
  { id: 'rawDateReceived', sourceColumn: 'DATE TENDER RECD', displayName: 'Date Received (Raw)', isVisible: false, order: 7 },
  { id: 'rfpReceivedDate', sourceColumn: '(Calculated)', displayName: 'RFP Received', isVisible: true, order: 8 },
  { id: 'avenirStatus', sourceColumn: 'AVENIR STATUS', displayName: 'AVENIR STATUS', isVisible: true, order: 9 },
  { id: 'tenderResult', sourceColumn: 'TENDER RESULT', displayName: 'TENDER RESULT', isVisible: true, order: 10 },
  { id: 'tenderStatusRemark', sourceColumn: 'TENDER STATUS', displayName: 'Status Remark', isVisible: false, order: 11 },
  { id: 'remarksReason', sourceColumn: 'REMARKS/REASON', displayName: 'Remarks', isVisible: false, order: 12 },
  { id: 'isSubmissionNear', sourceColumn: '(Calculated)', displayName: 'Submission Near', isVisible: false, order: 13 },
];

const STORAGE_KEY = 'field_mappings';

function loadMappings(): FieldMapping[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_MAPPINGS;
    }
  }
  return DEFAULT_MAPPINGS;
}

function saveMappings(mappings: FieldMapping[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
}

export default function DataMappingPanel() {
  const [mappings, setMappings] = useState<FieldMapping[]>(loadMappings);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const { tenders } = useData();

  // Get unique values from the actual data for preview
  const getFieldPreview = (fieldId: string): string => {
    if (tenders.length === 0) return 'No data';
    const tender = tenders[0];
    const value = (tender as any)[fieldId];
    if (value === null || value === undefined || value === '') return '(empty)';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value).substring(0, 30) + (String(value).length > 30 ? '...' : '');
  };

  const handleVisibilityToggle = (id: string) => {
    setMappings(prev => {
      const updated = prev.map(m => 
        m.id === id ? { ...m, isVisible: !m.isVisible } : m
      );
      setHasChanges(true);
      return updated;
    });
  };

  const handleStartEdit = (id: string, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }
    setMappings(prev => {
      const updated = prev.map(m => 
        m.id === id ? { ...m, displayName: editValue.trim() } : m
      );
      setHasChanges(true);
      return updated;
    });
    setEditingId(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveAll = () => {
    saveMappings(mappings);
    setHasChanges(false);
    toast.success('Field mappings saved');
  };

  const handleReset = () => {
    setMappings(DEFAULT_MAPPINGS);
    saveMappings(DEFAULT_MAPPINGS);
    setHasChanges(false);
    toast.info('Field mappings reset to defaults');
  };

  const visibleCount = mappings.filter(m => m.isVisible).length;
  const hiddenCount = mappings.filter(m => !m.isVisible).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Table2 className="h-5 w-5 text-primary" />
              Data Field Mappings
            </CardTitle>
            <CardDescription>
              Customize how collected data is displayed in the dashboard
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {visibleCount} visible
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {hiddenCount} hidden
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">{mappings.length}</p>
            <p className="text-xs text-muted-foreground">Total Fields</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold text-success">{visibleCount}</p>
            <p className="text-xs text-muted-foreground">Visible</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold text-muted-foreground">{hiddenCount}</p>
            <p className="text-xs text-muted-foreground">Hidden</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-2xl font-bold">{tenders.length}</p>
            <p className="text-xs text-muted-foreground">Records</p>
          </div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={handleSaveAll} 
            disabled={!hasChanges}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>

        <Separator />

        {/* Field List */}
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-2">
            {mappings.sort((a, b) => a.order - b.order).map((mapping) => (
              <div 
                key={mapping.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  mapping.isVisible 
                    ? 'bg-background border-border' 
                    : 'bg-muted/50 border-transparent opacity-60'
                }`}
              >
                {/* Drag Handle (visual only for now) */}
                <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab" />

                {/* Source Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono shrink-0">
                      {mapping.sourceColumn}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    
                    {/* Display Name (editable) */}
                    {editingId === mapping.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="h-7 w-32 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(mapping.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                        />
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={() => handleSaveEdit(mapping.id)}
                        >
                          <Check className="h-3 w-3 text-success" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium truncate">
                          {mapping.displayName}
                        </span>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={() => handleStartEdit(mapping.id, mapping.displayName)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview Value */}
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    Preview: {getFieldPreview(mapping.id)}
                  </p>
                </div>

                {/* Edit Button */}
                {editingId !== mapping.id && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-8 w-8 shrink-0"
                    onClick={() => handleStartEdit(mapping.id, mapping.displayName)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}

                {/* Visibility Toggle */}
                <div className="flex items-center gap-2 shrink-0">
                  <Switch
                    checked={mapping.isVisible}
                    onCheckedChange={() => handleVisibilityToggle(mapping.id)}
                  />
                  {mapping.isVisible ? (
                    <Eye className="h-4 w-4 text-success" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer Info */}
        <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <p className="font-medium mb-1">Field Mapping Info:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Toggle visibility to show/hide columns in tables and exports</li>
            <li>Click the edit icon to rename how fields appear in the UI</li>
            <li>Source columns show the original Google Sheets column names</li>
            <li>Fields marked "(Calculated)" are derived from other data</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
