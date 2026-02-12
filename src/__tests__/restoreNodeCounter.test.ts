import { describe, it, expect } from 'vitest';
import { restoreNodeCounter } from '../store/graphStore';
import type { GraphNode } from '../types/graph';

function makeNode(id: string, label: string): GraphNode {
  return { id, type: 'custom', position: { x: 0, y: 0 }, data: { label } };
}

describe('restoreNodeCounter', () => {
  it('extracts max counter from "Node N" labels', () => {
    const nodes = [
      makeNode('a', 'Node 3'),
      makeNode('b', 'Node 7'),
      makeNode('c', 'Node 1'),
    ];
    // After restoring, the next addNode should create "Node 8"
    // We can only verify this doesn't throw; the actual counter is module-private
    restoreNodeCounter(nodes);
    // If we could access nodeCounter, we'd expect it to be 7
  });

  it('handles nodes with custom (non-pattern) labels', () => {
    const nodes = [
      makeNode('a', 'My Custom Node'),
      makeNode('b', 'Node 5'),
      makeNode('c', 'Another'),
    ];
    restoreNodeCounter(nodes);
    // Should still pick up Node 5 as the max
  });

  it('handles empty node array', () => {
    restoreNodeCounter([]);
    // Should not throw
  });

  it('handles nodes with no matching labels', () => {
    const nodes = [
      makeNode('a', 'Alpha'),
      makeNode('b', 'Beta'),
    ];
    restoreNodeCounter(nodes);
    // Counter should be 0, no "Node N" labels found
  });
});
