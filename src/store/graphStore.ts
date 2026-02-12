import { create } from 'zustand';
import {
  type Connection,
  type EdgeChange,
  type NodeChange,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import type { GraphNode, GraphEdge, GraphMode, GraphEdgeData } from '../types/graph';
import { generateId } from '../utils/graphHelpers';

interface GraphState {
  // State
  nodes: GraphNode[];
  edges: GraphEdge[];
  graphMode: GraphMode;
  highlightedNodes: Set<string>;
  highlightedEdges: Set<string>;

  // Node actions
  addNode: (position?: { x: number; y: number }) => void;
  deleteNode: (nodeId: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;

  // Edge actions
  addEdge: (connection: Connection) => void;
  deleteEdge: (edgeId: string) => void;
  updateEdgeWeight: (edgeId: string, weight: number) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;

  // Graph mode
  toggleDirected: () => void;

  // Highlight actions (for algorithms)
  setHighlightedNodes: (nodeIds: Set<string>) => void;
  setHighlightedEdges: (edgeIds: Set<string>) => void;
  clearHighlights: () => void;

  // Persistence
  clearGraph: () => void;
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  setGraphMode: (mode: GraphMode) => void;
}

let nodeCounter = 0;

/**
 * Restore nodeCounter from existing node labels to avoid duplicate labels after reload.
 * Parses labels like "Node 5" and sets the counter to the max found number.
 */
export function restoreNodeCounter(nodes: GraphNode[]) {
  let max = 0;
  for (const node of nodes) {
    const match = node.data?.label?.match(/^Node\s+(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > max) max = num;
    }
  }
  nodeCounter = max;
}

function buildEdgeWithMarkers(
  id: string,
  source: string,
  target: string,
  mode: GraphMode,
  data: GraphEdgeData,
  sourceHandle?: string | null,
  targetHandle?: string | null,
): GraphEdge {
  return {
    id,
    source,
    target,
    sourceHandle: sourceHandle ?? undefined,
    targetHandle: targetHandle ?? undefined,
    type: 'custom',
    data,
    markerEnd: mode === 'directed' ? { type: MarkerType.ArrowClosed, width: 20, height: 20 } : undefined,
  };
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  graphMode: 'undirected',
  highlightedNodes: new Set<string>(),
  highlightedEdges: new Set<string>(),

  // ── Node actions ──

  addNode: (position) => {
    nodeCounter += 1;
    const id = generateId('node');
    const newNode: GraphNode = {
      id,
      type: 'custom',
      position: position ?? { x: 250 + Math.random() * 200, y: 150 + Math.random() * 200 },
      data: { label: `Node ${nodeCounter}` },
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  },

  updateNodeLabel: (nodeId, label) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
    }));
  },

  onNodesChange: (changes) => {
    set((state) => {
      const updatedNodes = applyNodeChanges(changes, state.nodes) as GraphNode[];

      // If any nodes were removed, cascade-delete their edges
      const removedIds = changes
        .filter((c) => c.type === 'remove')
        .map((c) => c.id);

      if (removedIds.length > 0) {
        const removedSet = new Set(removedIds);
        const updatedEdges = state.edges.filter(
          (e) => !removedSet.has(e.source) && !removedSet.has(e.target)
        );
        return { nodes: updatedNodes, edges: updatedEdges };
      }

      return { nodes: updatedNodes };
    });
  },

  // ── Edge actions ──

  addEdge: (connection) => {
    if (!connection.source || !connection.target) return;

    // Prevent duplicate edges (in undirected mode, also check reverse)
    const { edges: currentEdges, graphMode: currentMode } = get();
    const existing = currentEdges.find(
      (e) =>
        (e.source === connection.source && e.target === connection.target) ||
        (currentMode === 'undirected' &&
          e.source === connection.target && e.target === connection.source)
    );
    if (existing) return;

    // Prevent self-loops
    if (connection.source === connection.target) return;

    const id = generateId('edge');
    const data: GraphEdgeData = { weight: 1 };
    const newEdge = buildEdgeWithMarkers(
      id, connection.source, connection.target, get().graphMode, data,
      connection.sourceHandle, connection.targetHandle,
    );

    set((state) => ({ edges: [...state.edges, newEdge] }));
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
    }));
  },

  updateEdgeWeight: (edgeId, weight) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data!, weight } } : e
      ),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges) as GraphEdge[],
    }));
  },

  // ── Graph mode ──

  toggleDirected: () => {
    set((state) => {
      const newMode: GraphMode = state.graphMode === 'directed' ? 'undirected' : 'directed';
      const updatedEdges = state.edges.map((e) =>
        buildEdgeWithMarkers(e.id, e.source, e.target, newMode, e.data ?? { weight: 1 }, e.sourceHandle, e.targetHandle)
      );
      return { graphMode: newMode, edges: updatedEdges };
    });
  },

  // ── Highlights ──

  setHighlightedNodes: (nodeIds) => set({ highlightedNodes: nodeIds }),
  setHighlightedEdges: (edgeIds) => set({ highlightedEdges: edgeIds }),
  clearHighlights: () =>
    set({ highlightedNodes: new Set(), highlightedEdges: new Set() }),

  // ── Persistence ──

  clearGraph: () => {
    nodeCounter = 0;
    set({
      nodes: [],
      edges: [],
      highlightedNodes: new Set(),
      highlightedEdges: new Set(),
    });
  },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setGraphMode: (mode) => set({ graphMode: mode }),
}));
