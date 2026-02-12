import { describe, it, expect } from 'vitest';
import { bfs } from '../algorithms/bfs';
import type { AdjacencyList } from '../types/graph';

function makeAdjacency(entries: Record<string, Array<{ targetId: string; edgeId: string; weight: number }>>): AdjacencyList {
  const map: AdjacencyList = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, value);
  }
  return map;
}

describe('BFS', () => {
  it('traverses a single node graph', () => {
    const adj = makeAdjacency({ a: [] });
    const result = bfs(adj, 'a');

    expect(result.type).toBe('bfs');
    expect(result.steps).toEqual([{ nodeId: 'a', edgeId: undefined }]);
  });

  it('traverses a linear graph in breadth-first order', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [{ targetId: 'c', edgeId: 'e2', weight: 1 }],
      c: [],
    });
    const result = bfs(adj, 'a');

    expect(result.steps.map((s) => s.nodeId)).toEqual(['a', 'b', 'c']);
  });

  it('traverses a tree breadth-first (level by level)', () => {
    //     a
    //    / \
    //   b   c
    //  / \
    // d   e
    const adj = makeAdjacency({
      a: [
        { targetId: 'b', edgeId: 'e1', weight: 1 },
        { targetId: 'c', edgeId: 'e2', weight: 1 },
      ],
      b: [
        { targetId: 'd', edgeId: 'e3', weight: 1 },
        { targetId: 'e', edgeId: 'e4', weight: 1 },
      ],
      c: [],
      d: [],
      e: [],
    });
    const result = bfs(adj, 'a');

    expect(result.steps.map((s) => s.nodeId)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('does not visit unreachable nodes', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [],
      c: [],  // disconnected
    });
    const result = bfs(adj, 'a');

    expect(result.steps.map((s) => s.nodeId)).toEqual(['a', 'b']);
  });

  it('handles cycles without infinite loop', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [{ targetId: 'a', edgeId: 'e2', weight: 1 }],
    });
    const result = bfs(adj, 'a');

    expect(result.steps.map((s) => s.nodeId)).toEqual(['a', 'b']);
  });

  it('records edge IDs in steps', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [],
    });
    const result = bfs(adj, 'a');

    expect(result.steps[0].edgeId).toBeUndefined(); // start node has no incoming edge
    expect(result.steps[1].edgeId).toBe('e1');
  });
});
