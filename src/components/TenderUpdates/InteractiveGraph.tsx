import { useState, useRef, useCallback } from 'react';
import { TenderData } from '@/services/dataCollection';
import { TenderUpdate, getNextDueDate } from '@/data/tenderUpdatesData';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Maximize2, ZoomIn, ZoomOut, Search, Home } from 'lucide-react';

interface InteractiveGraphProps {
  tender: TenderData | null;
  updates: TenderUpdate[];
  onSelectTender: (id: string) => void;
}

interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  id: string;
  label: string;
  type: 'tender' | 'update' | 'lane';
  color: string;
  borderColor?: string;
  data?: any;
}

export function InteractiveGraph({ tender, updates, onSelectTender }: InteractiveGraphProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  if (!tender) {
    return (
      <Button variant="outline" size="sm" disabled className="opacity-50">
        <Maximize2 className="h-4 w-4 mr-1" />
        Fullscreen Tree
      </Button>
    );
  }

  const tenderUpdates = updates.filter(u => u.opportunityId === tender.id);
  const subUpdates = tenderUpdates.filter(u => u.type === 'subcontractor').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const clientUpdates = tenderUpdates.filter(u => u.type === 'client').sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nodes: NodePosition[] = [];
  const edges: { from: string; to: string }[] = [];

  // Root tender node
  const rootId = `tender-${tender.id}`;
  nodes.push({ id: rootId, x: 300, y: 40, width: 260, height: 40, label: `${tender.tenderName} (${tender.refNo})`, type: 'tender', color: 'hsl(var(--primary))' });

  // Subcontractor lane
  const subLaneId = 'lane-sub';
  nodes.push({ id: subLaneId, x: 100, y: 120, width: 180, height: 34, label: `Subcontractor (${subUpdates.length})`, type: 'lane', color: 'hsl(var(--info))' });
  edges.push({ from: rootId, to: subLaneId });

  subUpdates.forEach((u, i) => {
    const uId = `sub-${u.id}`;
    const dueInfo = u.dueDate ? getNextDueDate(tender.id) : null;
    let borderColor: string | undefined;
    if (dueInfo?.status === 'overdue') borderColor = 'hsl(var(--destructive))';
    else if (dueInfo?.status === 'urgent') borderColor = 'hsl(38, 92%, 50%)';
    nodes.push({ id: uId, x: 60, y: 180 + i * 50, width: 260, height: 32, label: `${u.subType} — ${u.actor} (${new Date(u.date).toLocaleDateString()})`, type: 'update', color: 'hsl(var(--info))', borderColor, data: u });
    edges.push({ from: subLaneId, to: uId });
  });

  // Client lane
  const clientLaneId = 'lane-client';
  nodes.push({ id: clientLaneId, x: 500, y: 120, width: 180, height: 34, label: `Client (${clientUpdates.length})`, type: 'lane', color: 'hsl(var(--success))' });
  edges.push({ from: rootId, to: clientLaneId });

  clientUpdates.forEach((u, i) => {
    const uId = `client-${u.id}`;
    const dueInfo = u.dueDate ? getNextDueDate(tender.id) : null;
    let borderColor: string | undefined;
    if (dueInfo?.status === 'overdue') borderColor = 'hsl(var(--destructive))';
    else if (dueInfo?.status === 'urgent') borderColor = 'hsl(38, 92%, 50%)';
    nodes.push({ id: uId, x: 460, y: 180 + i * 50, width: 260, height: 32, label: `${u.subType} — ${u.actor} (${new Date(u.date).toLocaleDateString()})`, type: 'update', color: 'hsl(var(--success))', borderColor, data: u });
    edges.push({ from: clientLaneId, to: uId });
  });

  const maxEvents = Math.max(subUpdates.length, clientUpdates.length, 1);
  const totalHeight = 220 + maxEvents * 50;
  const totalWidth = 800;

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.max(0.2, Math.min(3, z + delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [dragging, dragStart]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const fitToScreen = () => {
    setZoom(0.9);
    setPan({ x: 40, y: 20 });
  };

  const highlightMatch = (label: string) => {
    if (!search) return false;
    return label.toLowerCase().includes(search.toLowerCase());
  };

  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  const graphContent = (
    <div className="relative w-full h-full overflow-hidden bg-background rounded-lg border" onWheel={handleWheel}>
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input className="h-8 w-48 pl-7 text-xs" placeholder="Search nodes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setZoom(z => Math.min(3, z + 0.2))}><ZoomIn className="h-3 w-3" /></Button>
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setZoom(z => Math.max(0.2, z - 0.2))}><ZoomOut className="h-3 w-3" /></Button>
        <Button size="icon" variant="outline" className="h-8 w-8" onClick={fitToScreen}><Home className="h-3 w-3" /></Button>
      </div>
      <div className="absolute top-3 right-3 z-10 text-xs text-muted-foreground font-medium bg-card/80 backdrop-blur px-3 py-1.5 rounded-md border">
        {tender.tenderName}
      </div>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {edges.map((e, i) => {
            const from = nodeMap.get(e.from);
            const to = nodeMap.get(e.to);
            if (!from || !to) return null;
            const x1 = from.x + from.width / 2;
            const y1 = from.y + from.height;
            const x2 = to.x + to.width / 2;
            const y2 = to.y;
            const midY = (y1 + y2) / 2;
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth={1.5}
                strokeDasharray={from.type === 'lane' ? '4 2' : undefined}
              />
            );
          })}
          {nodes.map(node => {
            const isHighlighted = highlightMatch(node.label);
            const isRoot = node.type === 'tender';
            const isLane = node.type === 'lane';
            return (
              <g key={node.id} style={{ cursor: 'default' }}>
                {isRoot && (
                  <rect x={node.x - 3} y={node.y - 3} width={node.width + 6} height={node.height + 6} rx={12} fill="none" stroke={node.color} strokeWidth={2} opacity={0.3} />
                )}
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={isRoot ? 10 : isLane ? 8 : 6}
                  fill={isRoot || isLane ? node.color : 'hsl(var(--card))'}
                  stroke={isHighlighted ? 'hsl(var(--warning))' : (node.borderColor || node.color)}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  opacity={search && !isHighlighted ? 0.3 : 1}
                />
                <text
                  x={node.x + node.width / 2}
                  y={node.y + node.height / 2 + 4}
                  textAnchor="middle"
                  fontSize={isRoot ? 12 : isLane ? 11 : 10}
                  fill={isRoot || isLane ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
                  fontWeight={isRoot || isLane ? 600 : 400}
                >
                  {node.label.length > 35 ? node.label.substring(0, 33) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setOpen(true); fitToScreen(); }}>
        <Maximize2 className="h-4 w-4 mr-1" />
        Fullscreen Tree
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-[95vw] h-[90vh] p-2">
          {graphContent}
        </DialogContent>
      </Dialog>
    </>
  );
}
