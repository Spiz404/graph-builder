import type { AdjacencyList, AlgorithmResult, AlgorithmStep } from '../types/graph';

/**
 * Breadth-First Search.
 * Returns the traversal order as algorithm steps (node + edge visited).
 */
export function bfs(adjacency: AdjacencyList, startNodeId: string): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const visited = new Set<string>();
  const queue: Array<{ nodeId: string; edgeId?: string }> = [];

  queue.push({ nodeId: startNodeId });
  visited.add(startNodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;
    steps.push({ nodeId: current.nodeId, edgeId: current.edgeId });

    const neighbors = adjacency.get(current.nodeId) ?? [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.targetId)) {
        visited.add(neighbor.targetId);
        queue.push({ nodeId: neighbor.targetId, edgeId: neighbor.edgeId });
      }
    }
  }

  return { type: 'bfs', steps };
}
