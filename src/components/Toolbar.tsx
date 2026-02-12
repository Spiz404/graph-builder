import { useGraphStore, restoreNodeCounter } from '../store/graphStore';
import { useCallback, useRef } from 'react';
import type { GraphNode, GraphEdge, GraphMode } from '../types/graph';

interface ExportData {
  version: 1;
  graphMode: GraphMode;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export default function Toolbar() {
  const addNode = useGraphStore((s) => s.addNode);
  const toggleDirected = useGraphStore((s) => s.toggleDirected);
  const graphMode = useGraphStore((s) => s.graphMode);
  const clearGraph = useGraphStore((s) => s.clearGraph);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const setNodes = useGraphStore((s) => s.setNodes);
  const setEdges = useGraphStore((s) => s.setEdges);
  const setGraphMode = useGraphStore((s) => s.setGraphMode);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const data: ExportData = {
      version: 1,
      graphMode,
      nodes,
      edges,
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `graph-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [graphMode, nodes, edges]);

  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data: ExportData = JSON.parse(event.target?.result as string);
          if (data.nodes && data.edges) {
            setNodes(data.nodes);
            setEdges(data.edges);
            setGraphMode(data.graphMode ?? 'undirected');
            restoreNodeCounter(data.nodes);
          }
        } catch {
          alert('Invalid graph file. Please select a valid JSON export.');
        }
      };
      reader.readAsText(file);

      // Reset input so the same file can be imported again
      e.target.value = '';
    },
    [setNodes, setEdges, setGraphMode]
  );

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
      <h1 className="text-lg font-semibold text-gray-800 mr-4">Graph Builder</h1>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Add Node */}
      <button
        onClick={() => addNode()}
        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors cursor-pointer"
      >
        + Add Node
      </button>

      {/* Directed / Undirected toggle */}
      <button
        onClick={toggleDirected}
        className={`px-3 py-1.5 text-sm rounded border transition-colors cursor-pointer ${
          graphMode === 'directed'
            ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
            : 'bg-gray-100 text-gray-700 border-gray-300'
        }`}
      >
        {graphMode === 'directed' ? 'Directed' : 'Undirected'}
      </button>

      {/* Clear Graph */}
      <button
        onClick={clearGraph}
        className="px-3 py-1.5 text-sm rounded border border-red-300 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
      >
        Clear Graph
      </button>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={nodes.length === 0}
        className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Export JSON
      </button>

      {/* Import */}
      <button
        onClick={handleImport}
        className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
      >
        Import JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Stats */}
      <span className="text-xs text-gray-500">
        {nodes.length} nodes, {edges.length} edges
      </span>
    </div>
  );
}
