import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CloudUpload, Info } from 'lucide-react';
import SharePointSyncPanel from '@/components/Admin/SharePointSyncPanel';

const SharePoint = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CloudUpload className="h-6 w-6 text-primary" />
          SharePoint Integration
        </h1>
        <p className="text-muted-foreground">Connect to a live Excel file on SharePoint</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Read-Only Sync</AlertTitle>
        <AlertDescription>
          This integration reads data from your SharePoint Excel file. Changes made in the dashboard 
          will not be written back to SharePoint.
        </AlertDescription>
      </Alert>

      <SharePointSyncPanel />
    </div>
  );
};

export default SharePoint;
