import { useState } from 'react';
import { TenderData } from '@/services/dataCollection';
import { TenderUpdate, generateMermaidDiagram } from '@/data/tenderUpdatesData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Code } from 'lucide-react';
import { toast } from 'sonner';

interface MermaidPreviewProps {
  tenders: TenderData[];
  updates: TenderUpdate[];
}

export function MermaidPreview({ tenders, updates }: MermaidPreviewProps) {
  const [open, setOpen] = useState(false);

  const mermaidText = generateMermaidDiagram(tenders, updates);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(mermaidText);
    toast.success('Mermaid diagram copied to clipboard');
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Code className="h-4 w-4 mr-1" />
        Mermaid Preview
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Mermaid Diagram Preview</span>
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <pre className="bg-muted p-4 rounded-lg text-xs font-mono whitespace-pre-wrap">{mermaidText}</pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
