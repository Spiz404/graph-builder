import type { AdjacencyList, AlgorithmResult, AlgorithmStep } from '../types/graph';

/**
 * Depth-First Search.
 * Returns the traversal order as algorithm steps (node + edge visited).
 */
export function dfs(adjacency: AdjacencyList, startNodeId: string): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();

  function visit(nodeId: string, edgeId?: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);
    steps.push({ nodeId, edgeId });

    const neighbors = adjacency.get(nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.targetId)) {
        visit(neighbor.targetId, neighbor.edgeId);
      }
    }
  }

  visit(startNodeId);

  return { type: 'dfs', steps };
}
