import { useState, useRef, useCallback, useEffect } from 'react';
import { TenderData } from '@/services/dataCollection';
import { TenderUpdate, getNextDueDate } from '@/data/tenderUpdatesData';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Maximize2, ZoomIn, ZoomOut, Search, Home } from 'lucide-react';

interface InteractiveGraphProps {
  tenders: TenderData[];
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
  type: 'group' | 'tender' | 'update';
  color: string;
  borderColor?: string;
  parentId?: string;
  data?: any;
}

export function InteractiveGraph({ tenders, updates, onSelectTender }: InteractiveGraphProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const groups = new Map<string, TenderData[]>();
  tenders.forEach(t => {
    const g = t.groupClassification || 'Ungrouped';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(t);
  });

  // Build nodes
  const nodes: NodePosition[] = [];
  const edges: { from: string; to: string }[] = [];
  let yOffset = 40;

  groups.forEach((groupTenders, groupName) => {
    const gId = `group-${groupName}`;
    nodes.push({ id: gId, x: 40, y: yOffset, width: 180, height: 32, label: groupName, type: 'group', color: 'hsl(var(--primary))' });

    groupTenders.forEach((t, ti) => {
      const tId = `tender-${t.id}`;
      const tY = yOffset + (ti + 1) * 60;
      nodes.push({ id: tId, x: 260, y: tY, width: 200, height: 32, label: `${t.tenderName} (${t.refNo})`, type: 'tender', color: 'hsl(var(--card))', data: t });
      edges.push({ from: gId, to: tId });

      const tUpdates = updates.filter(u => u.opportunityId === t.id);
      tUpdates.forEach((u, ui) => {
        const uId = `update-${u.id}`;
        const uY = tY + (ui + 1) * 40;
        const isSubcontractor = u.type === 'subcontractor';
        const dueInfo = u.dueDate ? getNextDueDate(t.id) : null;
        let borderColor: string | undefined;
        if (dueInfo?.status === 'overdue') borderColor = 'hsl(var(--destructive))';
        else if (dueInfo?.status === 'urgent') borderColor = 'hsl(var(--warning))';

        nodes.push({
          id: uId,
          x: 500,
          y: uY,
          width: 220,
          height: 28,
          label: `${isSubcontractor ? 'SC' : 'CL'}: ${u.subType} — ${u.actor}`,
          type: 'update',
          color: isSubcontractor ? 'hsl(var(--info))' : 'hsl(var(--success))',
          borderColor,
          parentId: tId,
          data: u,
        });
        edges.push({ from: tId, to: uId });
      });

      yOffset = Math.max(yOffset, tY + tUpdates.length * 40 + 20);
    });
    yOffset += 60;
  });

  const totalHeight = yOffset + 60;
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
    setZoom(0.8);
    setPan({ x: 20, y: 20 });
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
          {/* Edges */}
          {edges.map((e, i) => {
            const from = nodeMap.get(e.from);
            const to = nodeMap.get(e.to);
            if (!from || !to) return null;
            return (
              <line
                key={i}
                x1={from.x + from.width}
                y1={from.y + from.height / 2}
                x2={to.x}
                y2={to.y + to.height / 2}
                stroke="hsl(var(--border))"
                strokeWidth={1.5}
              />
            );
          })}
          {/* Nodes */}
          {nodes.map(node => {
            const isHighlighted = highlightMatch(node.label);
            return (
              <g
                key={node.id}
                onClick={() => {
                  if (node.type === 'tender' && node.data) onSelectTender(node.data.id);
                }}
                style={{ cursor: node.type === 'tender' ? 'pointer' : 'default' }}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={6}
                  fill={node.type === 'group' ? node.color : 'hsl(var(--card))'}
                  stroke={isHighlighted ? 'hsl(var(--warning))' : (node.borderColor || node.color)}
                  strokeWidth={isHighlighted ? 3 : node.type === 'update' ? 2 : 1.5}
                  opacity={search && !isHighlighted ? 0.3 : 1}
                />
                <text
                  x={node.x + 8}
                  y={node.y + node.height / 2 + 4}
                  fontSize={node.type === 'group' ? 12 : 10}
                  fill={node.type === 'group' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))'}
                  fontWeight={node.type === 'group' ? 600 : 400}
                >
                  {node.label.length > 30 ? node.label.substring(0, 28) + '...' : node.label}
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
