import type { AdjacencyList, AlgorithmResult, AlgorithmStep } from '../types/graph';

/**
 * Dijkstra's shortest path algorithm.
 * Returns the shortest path from startNodeId to endNodeId,
 * including traversal steps for animation and the final path with total weight.
 */
export function dijkstra(
  adjacency: AdjacencyList,
  startNodeId: string,
  endNodeId: string
): AlgorithmResult {
  const steps: AlgorithmStep[] = [];
  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; edgeId: string } | null>();
  const unvisited = new Set<string>();

  // Initialize
  for (const nodeId of adjacency.keys()) {
    distances.set(nodeId, nodeId === startNodeId ? 0 : Infinity);
    previous.set(nodeId, null);
    unvisited.add(nodeId);
  }

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentNode: string | null = null;
    let smallestDist = Infinity;

    for (const nodeId of unvisited) {
      const dist = distances.get(nodeId)!;
      if (dist < smallestDist) {
        smallestDist = dist;
        currentNode = nodeId;
      }
    }

    // No reachable nodes left
    if (currentNode === null || smallestDist === Infinity) break;

    unvisited.delete(currentNode);

    // Record this step
    const prevInfo = previous.get(currentNode);
    steps.push({ nodeId: currentNode, edgeId: prevInfo?.edgeId });

    // Found the target
    if (currentNode === endNodeId) break;

    // Update neighbors
    const neighbors = adjacency.get(currentNode) ?? [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.targetId)) continue;

      const newDist = smallestDist + neighbor.weight;
      if (newDist < distances.get(neighbor.targetId)!) {
        distances.set(neighbor.targetId, newDist);
        previous.set(neighbor.targetId, { nodeId: currentNode, edgeId: neighbor.edgeId });
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let current: string | null = endNodeId;

  while (current !== null) {
    path.unshift(current);
    const prev = previous.get(current);
    current = prev?.nodeId ?? null;
  }

  // Check if path is valid (starts with startNodeId)
  const totalWeight = distances.get(endNodeId) ?? Infinity;
  const validPath = path[0] === startNodeId && totalWeight !== Infinity;

  return {
    type: 'dijkstra',
    steps,
    path: validPath ? path : undefined,
    totalWeight: validPath ? totalWeight : undefined,
  };
}
