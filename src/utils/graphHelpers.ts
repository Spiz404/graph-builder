import type { GraphEdge, GraphNode, AdjacencyList, GraphMode } from '../types/graph';

let counter = 0;

/**
 * Generate a unique ID for nodes and edges.
 */
export function generateId(prefix: string = 'node'): string {
  counter += 1;
  return `${prefix}_${Date.now()}_${counter}`;
}

/**
 * Build an adjacency list from React Flow nodes and edges.
 * For undirected graphs, each edge is added in both directions.
 */
export function buildAdjacencyList(
  nodes: GraphNode[],
  edges: GraphEdge[],
  mode: GraphMode
): AdjacencyList {
  const adjacency: AdjacencyList = new Map();

  // Initialize all nodes with empty adjacency lists
  for (const node of nodes) {
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    const weight = edge.data?.weight ?? 1;

    // Add forward direction
    adjacency.get(edge.source)?.push({
      targetId: edge.target,
      edgeId: edge.id,
      weight,
    });

    // For undirected graphs, add reverse direction
    if (mode === 'undirected') {
      adjacency.get(edge.target)?.push({
        targetId: edge.source,
        edgeId: edge.id,
        weight,
      });
    }
  }

  return adjacency;
}
