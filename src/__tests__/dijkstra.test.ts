import { describe, it, expect } from 'vitest';
import { dijkstra } from '../algorithms/shortestPath';
import type { AdjacencyList } from '../types/graph';

function makeAdjacency(entries: Record<string, Array<{ targetId: string; edgeId: string; weight: number }>>): AdjacencyList {
  const map: AdjacencyList = new Map();
  for (const [key, value] of Object.entries(entries)) {
    map.set(key, value);
  }
  return map;
}

describe('Dijkstra shortest path', () => {
  it('finds path between adjacent nodes', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 5 }],
      b: [],
    });
    const result = dijkstra(adj, 'a', 'b');

    expect(result.type).toBe('dijkstra');
    expect(result.path).toEqual(['a', 'b']);
    expect(result.totalWeight).toBe(5);
  });

  it('finds shortest path among multiple options', () => {
    // a --1--> b --1--> d
    // a --10-> d  (direct but longer)
    const adj = makeAdjacency({
      a: [
        { targetId: 'b', edgeId: 'e1', weight: 1 },
        { targetId: 'd', edgeId: 'e3', weight: 10 },
      ],
      b: [{ targetId: 'd', edgeId: 'e2', weight: 1 }],
      d: [],
    });
    const result = dijkstra(adj, 'a', 'd');

    expect(result.path).toEqual(['a', 'b', 'd']);
    expect(result.totalWeight).toBe(2);
  });

  it('returns no path when target is unreachable', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [],
      c: [],  // disconnected
    });
    const result = dijkstra(adj, 'a', 'c');

    expect(result.path).toBeUndefined();
    expect(result.totalWeight).toBeUndefined();
  });

  it('handles path to self (start === end)', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [],
    });
    const result = dijkstra(adj, 'a', 'a');

    expect(result.path).toEqual(['a']);
    expect(result.totalWeight).toBe(0);
  });

  it('finds shortest path in a diamond graph', () => {
    //   a
    //  / \
    // b   c
    //  \ /
    //   d
    const adj = makeAdjacency({
      a: [
        { targetId: 'b', edgeId: 'e1', weight: 1 },
        { targetId: 'c', edgeId: 'e2', weight: 4 },
      ],
      b: [{ targetId: 'd', edgeId: 'e3', weight: 2 }],
      c: [{ targetId: 'd', edgeId: 'e4', weight: 1 }],
      d: [],
    });
    const result = dijkstra(adj, 'a', 'd');

    // a->b->d = 3, a->c->d = 5, so shortest is a->b->d
    expect(result.path).toEqual(['a', 'b', 'd']);
    expect(result.totalWeight).toBe(3);
  });

  it('records traversal steps for animation', () => {
    const adj = makeAdjacency({
      a: [{ targetId: 'b', edgeId: 'e1', weight: 1 }],
      b: [{ targetId: 'c', edgeId: 'e2', weight: 1 }],
      c: [],
    });
    const result = dijkstra(adj, 'a', 'c');

    expect(result.steps.length).toBeGreaterThan(0);
    expect(result.steps[0].nodeId).toBe('a');
    // All visited nodes should appear in steps
    const visitedNodes = result.steps.map((s) => s.nodeId);
    expect(visitedNodes).toContain('a');
    expect(visitedNodes).toContain('b');
    expect(visitedNodes).toContain('c');
  });

  it('handles graph with various weights', () => {
    const adj = makeAdjacency({
      a: [
        { targetId: 'b', edgeId: 'e1', weight: 7 },
        { targetId: 'c', edgeId: 'e2', weight: 2 },
      ],
      b: [{ targetId: 'd', edgeId: 'e3', weight: 1 }],
      c: [
        { targetId: 'b', edgeId: 'e4', weight: 3 },
        { targetId: 'd', edgeId: 'e5', weight: 8 },
      ],
      d: [],
    });
    const result = dijkstra(adj, 'a', 'd');

    // a->c->b->d = 2+3+1 = 6  vs  a->b->d = 7+1 = 8  vs  a->c->d = 2+8 = 10
    expect(result.path).toEqual(['a', 'c', 'b', 'd']);
    expect(result.totalWeight).toBe(6);
  });
});
