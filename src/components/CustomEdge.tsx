import { useState } from 'react';
import {
  getBezierPath,
  type EdgeProps,
  EdgeLabelRenderer,
} from 'reactflow';
import { useGraphStore } from '../store/graphStore';
import type { GraphEdgeData } from '../types/graph';

export default function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}: EdgeProps<GraphEdgeData>) {
  const [isHovered, setIsHovered] = useState(false);

  const deleteEdge = useGraphStore((s) => s.deleteEdge);
  const highlighted = useGraphStore((s) => s.highlightedEdges.has(id));

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const weight = data?.weight ?? 1;

  const strokeColor = highlighted
    ? '#facc15' // yellow-400
    : selected
      ? '#3b82f6' // blue-500
      : '#94a3b8'; // slate-400

  return (
    <>
      {/* Invisible wider path for easier hover/click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Visible edge path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={highlighted ? 3 : 2}
        markerEnd={markerEnd}
        className="transition-colors"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Edge label with weight and delete button */}
      <EdgeLabelRenderer>
        <div
          className="absolute flex items-center gap-1 pointer-events-auto"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span
            className={`text-xs px-1.5 py-0.5 rounded ${
              highlighted
                ? 'bg-yellow-100 text-yellow-800 font-bold'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {weight}
          </span>

          {isHovered && (
            <button
              className="w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center hover:bg-red-600 cursor-pointer leading-none"
              onClick={(e) => {
                e.stopPropagation();
                deleteEdge(id);
              }}
            >
              x
            </button>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
