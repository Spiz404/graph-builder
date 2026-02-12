import { useState, useCallback, useRef, useEffect } from 'react';
import { useGraphStore } from '../store/graphStore';
import { buildAdjacencyList } from '../utils/graphHelpers';
import { bfs } from '../algorithms/bfs';
import { dfs } from '../algorithms/dfs';
import { dijkstra } from '../algorithms/shortestPath';
import type { AlgorithmType, AlgorithmResult } from '../types/graph';

const ANIMATION_DELAY = 500; // ms between steps

export default function AlgorithmPanel() {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const graphMode = useGraphStore((s) => s.graphMode);
  const setHighlightedNodes = useGraphStore((s) => s.setHighlightedNodes);
  const setHighlightedEdges = useGraphStore((s) => s.setHighlightedEdges);
  const clearHighlights = useGraphStore((s) => s.clearHighlights);

  const [isOpen, setIsOpen] = useState(true);
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('bfs');
  const [startNode, setStartNode] = useState('');
  const [endNode, setEndNode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<AlgorithmResult | null>(null);

  const animationRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear stale node selections when nodes are deleted
  useEffect(() => {
    if (startNode && !nodes.find((n) => n.id === startNode)) {
      setStartNode('');
    }
    if (endNode && !nodes.find((n) => n.id === endNode)) {
      setEndNode('');
    }
  }, [nodes, startNode, endNode]);

  const stopAnimation = useCallback(() => {
    for (const timer of animationRef.current) {
      clearTimeout(timer);
    }
    animationRef.current = [];
    setIsRunning(false);
    clearHighlights();
  }, [clearHighlights]);

  const runAlgorithm = useCallback(() => {
    if (!startNode) return;
    if (algorithm === 'dijkstra' && !endNode) return;

    // Stop any running animation
    stopAnimation();

    const adjacency = buildAdjacencyList(nodes, edges, graphMode);

    let algoResult: AlgorithmResult;
    switch (algorithm) {
      case 'bfs':
        algoResult = bfs(adjacency, startNode);
        break;
      case 'dfs':
        algoResult = dfs(adjacency, startNode);
        break;
      case 'dijkstra':
        algoResult = dijkstra(adjacency, startNode, endNode);
        break;
    }

    setResult(algoResult);
    setIsRunning(true);

    // Animate step by step
    const highlightedNodeIds = new Set<string>();
    const highlightedEdgeIds = new Set<string>();

    algoResult.steps.forEach((step, index) => {
      const timer = setTimeout(() => {
        highlightedNodeIds.add(step.nodeId);
        if (step.edgeId) {
          highlightedEdgeIds.add(step.edgeId);
        }
        setHighlightedNodes(new Set(highlightedNodeIds));
        setHighlightedEdges(new Set(highlightedEdgeIds));

        // On last step, mark as done
        if (index === algoResult.steps.length - 1) {
          setIsRunning(false);
        }
      }, index * ANIMATION_DELAY);

      animationRef.current.push(timer);
    });

    // If no steps, immediately stop
    if (algoResult.steps.length === 0) {
      setIsRunning(false);
    }
  }, [startNode, endNode, algorithm, nodes, edges, graphMode, stopAnimation, setHighlightedNodes, setHighlightedEdges]);

  const getNodeLabel = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    return node?.data?.label ?? nodeId;
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-2 right-2 z-10 px-2 py-1 bg-white border border-gray-300 rounded text-xs text-gray-600 hover:bg-gray-50 cursor-pointer shadow"
      >
        Algorithms
      </button>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Algorithms</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600 cursor-pointer text-lg leading-none"
        >
          x
        </button>
      </div>

      <div className="p-4 flex flex-col gap-4">
        {/* Algorithm selector */}
        <div>
          <label className="block text-xs text-gray-500 font-medium mb-1">Algorithm</label>
          <select
            value={algorithm}
            onChange={(e) => {
              setAlgorithm(e.target.value as AlgorithmType);
              setResult(null);
              clearHighlights();
            }}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="bfs">BFS (Breadth-First Search)</option>
            <option value="dfs">DFS (Depth-First Search)</option>
            <option value="dijkstra">Dijkstra (Shortest Path)</option>
          </select>
        </div>

        {/* Start node */}
        <div>
          <label className="block text-xs text-gray-500 font-medium mb-1">Start Node</label>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Select --</option>
            {nodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.data.label}
              </option>
            ))}
          </select>
        </div>

        {/* End node (Dijkstra only) */}
        {algorithm === 'dijkstra' && (
          <div>
            <label className="block text-xs text-gray-500 font-medium mb-1">End Node</label>
            <select
              value={endNode}
              onChange={(e) => setEndNode(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select --</option>
              {nodes
                .filter((n) => n.id !== startNode)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.data.label}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Run / Stop buttons */}
        <div className="flex gap-2">
          <button
            onClick={runAlgorithm}
            disabled={isRunning || !startNode || (algorithm === 'dijkstra' && !endNode)}
            className="flex-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={stopAnimation}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="border-t border-gray-200 pt-3">
            <h3 className="text-xs font-semibold text-gray-600 mb-2">Results</h3>

            {/* Traversal order */}
            <div className="mb-2">
              <span className="text-xs text-gray-500">Traversal Order:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {result.steps.map((step, i) => (
                  <span
                    key={i}
                    className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded"
                  >
                    {getNodeLabel(step.nodeId)}
                  </span>
                ))}
              </div>
            </div>

            {/* Dijkstra-specific results */}
            {result.type === 'dijkstra' && (
              <>
                {result.path ? (
                  <div>
                    <span className="text-xs text-gray-500">Shortest Path:</span>
                    <div className="mt-1 flex items-center flex-wrap gap-1">
                      {result.path.map((nodeId, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded">
                            {getNodeLabel(nodeId)}
                          </span>
                          {i < result.path!.length - 1 && (
                            <span className="text-gray-400 text-xs">&rarr;</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Total Weight: <span className="font-semibold">{result.totalWeight}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-red-500">
                    No path found between selected nodes.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
