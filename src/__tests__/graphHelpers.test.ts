import { describe, it, expect } from 'vitest';
import { buildAdjacencyList } from '../utils/graphHelpers';
import type { GraphNode, GraphEdge } from '../types/graph';

function makeNode(id: string, label: string): GraphNode {
  return { id, type: 'custom', position: { x: 0, y: 0 }, data: { label } };
}

function makeEdge(id: string, source: string, target: string, weight = 1): GraphEdge {
  return { id, source, target, type: 'custom', data: { weight } };
}

describe('buildAdjacencyList', () => {
  it('returns empty adjacency for nodes with no edges', () => {
    const nodes = [makeNode('a', 'A'), makeNode('b', 'B')];
    const adj = buildAdjacencyList(nodes, [], 'undirected');

    expect(adj.size).toBe(2);
    expect(adj.get('a')).toEqual([]);
    expect(adj.get('b')).toEqual([]);
  });

  it('builds directed adjacency (one direction only)', () => {
    const nodes = [makeNode('a', 'A'), makeNode('b', 'B')];
    const edges = [makeEdge('e1', 'a', 'b', 5)];
    const adj = buildAdjacencyList(nodes, edges, 'directed');

    expect(adj.get('a')).toEqual([{ targetId: 'b', edgeId: 'e1', weight: 5 }]);
    expect(adj.get('b')).toEqual([]);
  });

  it('builds undirected adjacency (both directions)', () => {
    const nodes = [makeNode('a', 'A'), makeNode('b', 'B')];
    const edges = [makeEdge('e1', 'a', 'b', 3)];
    const adj = buildAdjacencyList(nodes, edges, 'undirected');

    expect(adj.get('a')).toEqual([{ targetId: 'b', edgeId: 'e1', weight: 3 }]);
    expect(adj.get('b')).toEqual([{ targetId: 'a', edgeId: 'e1', weight: 3 }]);
  });

  it('handles multiple edges', () => {
    const nodes = [makeNode('a', 'A'), makeNode('b', 'B'), makeNode('c', 'C')];
    const edges = [
      makeEdge('e1', 'a', 'b', 1),
      makeEdge('e2', 'b', 'c', 2),
    ];
    const adj = buildAdjacencyList(nodes, edges, 'directed');

    expect(adj.get('a')!.length).toBe(1);
    expect(adj.get('b')!.length).toBe(1);
    expect(adj.get('c')!.length).toBe(0);
  });

  it('defaults edge weight to 1 when data is missing', () => {
    const nodes = [makeNode('a', 'A'), makeNode('b', 'B')];
    const edges: GraphEdge[] = [{ id: 'e1', source: 'a', target: 'b', type: 'custom' }];
    const adj = buildAdjacencyList(nodes, edges, 'directed');

    expect(adj.get('a')![0].weight).toBe(1);
  });
});
