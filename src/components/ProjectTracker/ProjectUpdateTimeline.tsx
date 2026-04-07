import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { ProjectUpdate, UpdateType } from '@/data/projectUpdatesData';
import { FileText, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TYPE_CONFIG: Record<UpdateType, { bg: string; border: string; label: string; icon: string }> = {
  vendor_contacted:    { bg: '#1E3A8A', border: '#60A5FA', label: 'VENDOR CONTACTED', icon: '📞' },
  vendor_response:     { bg: '#064E3B', border: '#34D399', label: 'VENDOR RESPONSE', icon: '✅' },
  vendor_finalized:    { bg: '#064E25', border: '#4ADE80', label: 'VENDOR FINALIZED', icon: '🤝' },
  extension_requested: { bg: '#78350F', border: '#FBBF24', label: 'EXTENSION REQ.', icon: '⏰' },
  due_date_changed:    { bg: '#3B0764', border: '#A78BFA', label: 'DUE DATE CHANGED', icon: '📅' },
  status_update:       { bg: '#1E293B', border: '#94A3B8', label: 'STATUS UPDATE', icon: '📋' },
  general_note:        { bg: '#27272A', border: '#A1A1AA', label: 'GENERAL NOTE', icon: '📝' },
};

const NODE_W = 230, NODE_H = 170, H_GAP = 90, V_GAP = 110, PAD = 80;

interface TreeNode {
  update: ProjectUpdate;
  children: TreeNode[];
  x: number;
  y: number;
  width: number;
}

function buildForest(updates: ProjectUpdate[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  updates.forEach(u => map.set(u.id, { update: u, children: [], x: 0, y: 0, width: NODE_W }));
  const roots: TreeNode[] = [];
  updates.forEach(u => {
    const node = map.get(u.id)!;
    if (u.parentUpdateId && map.has(u.parentUpdateId)) {
      map.get(u.parentUpdateId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function subtreeWidth(node: TreeNode): number {
  if (node.children.length === 0) return NODE_W;
  const sum = node.children.reduce((a, c) => a + subtreeWidth(c), 0);
  return sum + (node.children.length - 1) * H_GAP;
}

function assignPositions(node: TreeNode, offsetX: number, depth: number) {
  const w = subtreeWidth(node);
  node.width = w;
  node.x = offsetX + w / 2 - NODE_W / 2;
  node.y = depth * (NODE_H + V_GAP) + PAD;
  let childOffset = offsetX;
  node.children.forEach(child => {
    const cw = subtreeWidth(child);
    assignPositions(child, childOffset, depth + 1);
    childOffset += cw + H_GAP;
  });
}

function flattenNodes(node: TreeNode): TreeNode[] {
  return [node, ...node.children.flatMap(flattenNodes)];
}

interface Edge { x1: number; y1: number; x2: number; y2: number; color: string }

function collectEdges(node: TreeNode): Edge[] {
  const edges: Edge[] = [];
  const parentColor = TYPE_CONFIG[node.update.updateType]?.border || '#94A3B8';
  node.children.forEach(child => {
    edges.push({
      x1: node.x + NODE_W / 2, y1: node.y + NODE_H,
      x2: child.x + NODE_W / 2, y2: child.y,
      color: parentColor,
    });
    edges.push(...collectEdges(child));
  });
  return edges;
}

function NodeCard({ node }: { node: TreeNode }) {
  const u = node.update;
  const cfg = TYPE_CONFIG[u.updateType] || TYPE_CONFIG.general_note;
  const isRoot = !u.parentUpdateId;

  return (
    <div
      style={{
        position: 'absolute', left: node.x, top: node.y,
        width: NODE_W, height: NODE_H,
        background: '#0F172A', borderRadius: 12,
        border: `2px solid ${cfg.border}`,
        boxShadow: isRoot ? `0 0 20px ${cfg.border}55` : '0 2px 8px rgba(0,0,0,0.3)',
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div style={{ background: cfg.bg, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>{cfg.icon}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: cfg.border, letterSpacing: 1, textTransform: 'uppercase', flex: 1 }}>{cfg.label}</span>
        {isRoot && <span style={{ fontSize: 8, background: cfg.border + '33', color: cfg.border, padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>ROOT</span>}
      </div>
      {/* Body */}
      <div style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4, overflow: 'hidden' }}>
        {u.vendorName && <div style={{ color: '#fff', fontWeight: 700, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.vendorName}</div>}
        {u.contactDate && <div style={{ color: '#94A3B8', fontSize: 10 }}>📅 {u.contactDate}</div>}
        {u.responseDate && <div style={{ color: '#94A3B8', fontSize: 10 }}>📩 {u.responseDate}</div>}
        {u.finalizedDate && <div style={{ color: '#94A3B8', fontSize: 10 }}>✅ {u.finalizedDate}</div>}
        {u.responseDetails && (
          <div style={{ background: '#131C2E', borderRadius: 6, padding: '4px 6px', fontSize: 10, color: '#94A3B8', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
            {u.responseDetails}
          </div>
        )}
        {u.finalInstructions && (
          <div style={{ background: '#0A1F12', borderRadius: 6, padding: '4px 6px', fontSize: 10, color: '#4ADE80', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            <span style={{ fontWeight: 700 }}>FINAL: </span>{u.finalInstructions}
          </div>
        )}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {u.finalDecision && (
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
              background: u.finalDecision === 'accepted' ? '#16A34A22' : u.finalDecision === 'rejected' ? '#DC262622' : '#D9770622',
              color: u.finalDecision === 'accepted' ? '#4ADE80' : u.finalDecision === 'rejected' ? '#F87171' : '#FBBF24',
            }}>
              {u.finalDecision === 'accepted' ? '✅' : u.finalDecision === 'rejected' ? '❌' : '🔄'} {u.finalDecision}
            </span>
          )}
          {u.finalPrice != null && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: '#1E3A8A44', color: '#60A5FA' }}>
              ${u.finalPrice.toLocaleString()}
            </span>
          )}
        </div>
        {u.extensionDate && <div style={{ color: '#FBBF24', fontSize: 10 }}>⏰ Ext: {u.extensionDate}</div>}
        {u.notes && <div style={{ color: '#64748B', fontSize: 10, fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.notes}</div>}
      </div>
      {/* Footer */}
      <div style={{ borderTop: '1px solid #1E293B', padding: '4px 10px', display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#475569' }}>
        <span>{u.updatedBy.split('@')[0]}</span>
        <span>{new Date(u.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

interface Props {
  updates: ProjectUpdate[];
}

export function ProjectUpdateTimeline({ updates }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const [transform, setTransformState] = useState({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; startTx: number; startTy: number }>({ dragging: false, startX: 0, startY: 0, startTx: 0, startTy: 0 });

  const setTransform = useCallback((fn: ((prev: typeof transform) => typeof transform) | typeof transform) => {
    const next = typeof fn === 'function' ? fn(transformRef.current) : fn;
    transformRef.current = next;
    setTransformState(next);
  }, []);

  const { roots, allNodes, allEdges, canvasW, canvasH } = useMemo(() => {
    const roots = buildForest(updates);
    let offsetX = PAD;
    roots.forEach(r => {
      assignPositions(r, offsetX, 0);
      offsetX += subtreeWidth(r) + H_GAP * 2;
    });
    const allNodes = roots.flatMap(flattenNodes);
    const allEdges = roots.flatMap(collectEdges);
    const canvasW = allNodes.length > 0 ? Math.max(...allNodes.map(n => n.x + NODE_W)) + PAD * 2 : 600;
    const canvasH = allNodes.length > 0 ? Math.max(...allNodes.map(n => n.y + NODE_H)) + PAD * 2 : 400;
    return { roots, allNodes, allEdges, canvasW, canvasH };
  }, [updates]);

  // Wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      setTransform(prev => {
        const newScale = Math.max(0.08, Math.min(6, prev.scale * factor));
        const ratio = newScale / prev.scale;
        return { scale: newScale, x: mx - ratio * (mx - prev.x), y: my - ratio * (my - prev.y) };
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [setTransform]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, startTx: transformRef.current.x, startTy: transformRef.current.y };
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current.dragging) return;
      setTransform({ ...transformRef.current, x: dragRef.current.startTx + ev.clientX - dragRef.current.startX, y: dragRef.current.startTy + ev.clientY - dragRef.current.startY });
    };
    const onUp = () => { dragRef.current.dragging = false; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [setTransform]);

  const fitToScreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scaleX = (rect.width * 0.9) / canvasW;
    const scaleY = (rect.height * 0.9) / canvasH;
    const scale = Math.min(scaleX, scaleY, 2);
    const x = (rect.width - canvasW * scale) / 2;
    const y = (rect.height - canvasH * scale) / 2;
    setTransform({ x, y, scale });
  }, [canvasW, canvasH, setTransform]);

  useEffect(() => { if (allNodes.length > 0) fitToScreen(); }, [allNodes.length, fitToScreen]);

  if (updates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3" style={{ minHeight: 400 }}>
        <FileText className="h-12 w-12 opacity-40" />
        <p className="text-sm">No updates logged yet</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} onMouseDown={onMouseDown} style={{ width: '100%', height: '100%', minHeight: 500, position: 'relative', overflow: 'hidden', background: '#080E1A', borderRadius: 12, cursor: dragRef.current.dragging ? 'grabbing' : 'grab', userSelect: 'none' }}>
      {/* Grid pattern */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <pattern id="pt-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.5" fill="#1E293B" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pt-grid)" />
      </svg>

      {/* Canvas */}
      <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`, width: canvasW, height: canvasH }}>
        {/* SVG edges */}
        <svg style={{ position: 'absolute', inset: 0, width: canvasW, height: canvasH, pointerEvents: 'none' }}>
          <defs>
            <marker id="pt-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#475569" />
            </marker>
          </defs>
          {allEdges.map((e, i) => {
            const midY = (e.y1 + e.y2) / 2;
            const d = `M ${e.x1} ${e.y1} C ${e.x1} ${midY}, ${e.x2} ${midY}, ${e.x2} ${e.y2}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={e.color} strokeWidth={3} strokeOpacity={0.15} />
                <path d={d} fill="none" stroke={e.color} strokeWidth={1.5} markerEnd="url(#pt-arrow)" />
                <circle cx={e.x1} cy={e.y1} r={3} fill={e.color} />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {allNodes.map(n => <NodeCard key={n.update.id} node={n} />)}
      </div>

      {/* Controls */}
      <div className="absolute top-3 right-3 flex gap-1">
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur" onClick={() => setTransform(p => ({ ...p, scale: Math.min(6, p.scale * 1.2) }))}>
          <ZoomIn className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur" onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.08, p.scale * 0.8) }))}>
          <ZoomOut className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="outline" className="h-7 w-7 bg-background/80 backdrop-blur" onClick={fitToScreen}>
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Scale indicator */}
      <div className="absolute bottom-3 left-3 text-[10px] text-muted-foreground/50 font-mono">{Math.round(transform.scale * 100)}%</div>
      <div className="absolute bottom-3 right-3 text-[10px] text-muted-foreground/30">Scroll to zoom · Drag to pan</div>
    </div>
  );
}
