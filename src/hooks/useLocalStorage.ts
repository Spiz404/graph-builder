import { useEffect, useRef } from 'react';
import { useGraphStore, restoreNodeCounter } from '../store/graphStore';
import type { GraphNode, GraphEdge, GraphMode } from '../types/graph';

const STORAGE_KEY = 'graph-builder-state';
const DEBOUNCE_MS = 300;

interface PersistedState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  graphMode: GraphMode;
}

/**
 * Hook that syncs graph store state to localStorage.
 * - On mount: restores state from localStorage if available.
 * - On change: saves state to localStorage (debounced to avoid performance issues during dragging).
 */
export function useLocalStorage() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const graphMode = useGraphStore((s) => s.graphMode);
  const setNodes = useGraphStore((s) => s.setNodes);
  const setEdges = useGraphStore((s) => s.setEdges);
  const setGraphMode = useGraphStore((s) => s.setGraphMode);

  const isInitialized = useRef(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restore from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: PersistedState = JSON.parse(stored);
        if (parsed.nodes?.length) {
          setNodes(parsed.nodes ?? []);
          setEdges(parsed.edges ?? []);
          setGraphMode(parsed.graphMode ?? 'undirected');
          restoreNodeCounter(parsed.nodes ?? []);
        }
      }
    } catch {
      // Ignore invalid stored data
    }
    isInitialized.current = true;
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage on every state change (debounced, after initialization)
  useEffect(() => {
    if (!isInitialized.current) return;

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const state: PersistedState = { nodes, edges, graphMode };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // localStorage might be full or unavailable
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [nodes, edges, graphMode]);
}
