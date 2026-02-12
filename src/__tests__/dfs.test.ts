import { describe, it, expect } from 'vitest';
import { dfs } from '../algorithms/dfs';
import type { AdjacencyList } from '../types/graph';

function makeAdjacency(entries: Record<string, Array<{ targetId: string; edgeId: string; weight: number }>>): AdjacencyList {
  const map: AdjacencyList = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, value);
  }
  return map;
}

describe('DFS', () => {
  it('traverses a single node graph', () => {
    const adj = makeAdjacency({ a: [] });
    const result = dfs(adj, 'a');

    expect(result.type).toBe('dfs');
    expect(result.steps).toEqual([{ nodeId: 'a', edgeId: undefined }]);
  });

  it('traverses a linear graph', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [{ targetId: 'c', edgeId: 'e2', weight: 1 }],
      c: [],
    });
    const result = dfs(adj, 'a');

    expect(result.steps.map((s) => s.nodeId)).toEqual(['a', 'b', 'c']);
  });

  it('traverses depth-first (goes deep before wide)', () => {
    //     a
    //    / \
    //   b   c
    //  /
    // d
    const adj = makeAdjacency({
      a: [
        { targetId: 'b', edgeId: 'e1', weight: 1 },
        { targetId: 'c', edgeId: 'e2', weight: 1 },
      ],
      b: [{ targetId: 'd', edgeId: 'e3', weight: 1 }],
      c: [],
      d: [],
    });
    const result = dfs(adj, 'a');

    // DFS should go a -> b -> d -> c (depth first through b before visiting c)
    expect(result.steps.map((s) => s.nodeId)).toEqual(['a', 'b', 'd', 'c']);
  });

  it('does not visit unreachable nodes', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [],
      c: [],  // disconnected
    });
    const result = dfs(adj, 'a');

    expect(result.steps.map((s) => s.nodeId)).toEqual(['a', 'b']);
  });

  it('handles cycles without infinite loop', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [{ targetId: 'c', edgeId: 'e2', weight: 1 }],
      c: [{ targetId: 'a', edgeId: 'e3', weight: 1 }],
    });
    const result = dfs(adj, 'a');

    expect(result.steps.map((s) => s.nodeId)).toEqual(['a', 'b', 'c']);
  });

  it('records edge IDs in steps', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [{ targetId: 'c', edgeId: 'e2', weight: 1 }],
      c: [],
    });
    const result = dfs(adj, 'a');

    expect(result.steps[0].edgeId).toBeUndefined();
    expect(result.steps[1].edgeId).toBe('e1');
    expect(result.steps[2].edgeId).toBe('e2');
  });
});
