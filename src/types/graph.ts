import type { Node, Edge } from 'reactflow';

// Graph mode: directed or undirected
export type GraphMode = 'directed' | 'undirected';

// Custom data stored on each node
export interface GraphNodeData {
  label: string;
}

// Custom data stored on each edge
export interface GraphEdgeData {
  weight: number;
}

// Typed aliases for React Flow's Node/Edge with our custom data
export type GraphNode = Node<GraphNodeData>;
export type GraphEdge = Edge<GraphEdgeData>;

// Adjacency list representation for algorithms
export interface AdjacencyListEntry {
  targetId: string;
  edgeId: string;
  weight: number;
}

export type AdjacencyList = Map<string, AdjacencyListEntry[]>;

// Algorithm types
export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra';

export interface AlgorithmStep {
  nodeId: string;
  edgeId?: string;
}

export interface AlgorithmResult {
  type: AlgorithmType;
  steps: AlgorithmStep[];
  path?: string[];       // For Dijkstra: ordered node IDs in shortest path
  totalWeight?: number;  // For Dijkstra: total path weight
}
