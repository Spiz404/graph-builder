import { useCallback, useMemo, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useGraphStore } from '../store/graphStore';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import EdgeWeightModal from './EdgeWeightModal';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

interface SelectedEdgeInfo {
  edgeId: string;
  weight: number;
  position: { x: number; y: number };
}

export default function GraphCanvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, addEdge } = useGraphStore();

  const [selectedEdge, setSelectedEdge] = useState<SelectedEdgeInfo | null>(null);

  const onConnect = useCallback(
    (connection: Connection) => {
      addEdge(connection);
    },
    [addEdge]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      const weight = edge.data?.weight ?? 1;
      setSelectedEdge({
        edgeId: edge.id,
        weight,
        position: { x: event.clientX, y: event.clientY },
      });
    },
    []
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'custom',
    }),
    []
  );

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        className="bg-gray-50"
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor="#3b82f6"
          maskColor="rgba(0, 0, 0, 0.1)"
          className="!bg-white"
        />
      </ReactFlow>

      {/* Edge weight edit modal */}
      {selectedEdge && (
        <EdgeWeightModal
          edgeId={selectedEdge.edgeId}
          currentWeight={selectedEdge.weight}
          position={selectedEdge.position}
          onClose={() => setSelectedEdge(null)}
        />
      )}
    </div>
  );
}
