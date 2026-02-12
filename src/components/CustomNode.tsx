import { useState, useCallback, type KeyboardEvent } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { useGraphStore } from '../store/graphStore';
import type { GraphNodeData } from '../types/graph';

export default function CustomNode({ id, data, selected }: NodeProps<GraphNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(data.label);
  const [isHovered, setIsHovered] = useState(false);

  const deleteNode = useGraphStore((s) => s.deleteNode);
  const updateNodeLabel = useGraphStore((s) => s.updateNodeLabel);
  const highlighted = useGraphStore((s) => s.highlightedNodes.has(id));

  const handleDoubleClick = useCallback(() => {
    setEditValue(data.label);
    setIsEditing(true);
  }, [data.label]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editValue.trim()) {
      updateNodeLabel(id, editValue.trim());
    }
  }, [editValue, id, updateNodeLabel]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleBlur();
      }
      if (e.key === 'Escape') {
        setIsEditing(false);
        setEditValue(data.label);
      }
    },
    [handleBlur, data.label]
  );

  const borderColor = highlighted
    ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
    : selected
      ? 'border-blue-500'
      : 'border-gray-300';

  return (
    <div
      className={`relative w-16 h-16 bg-white rounded-full border-2 ${borderColor} flex items-center justify-center cursor-grab active:cursor-grabbing transition-colors`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {/* Connection handles — source + target on all 4 sides */}
      <Handle type="target" id="top" position={Position.Top} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" id="top" position={Position.Top} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="target" id="right" position={Position.Right} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" id="right" position={Position.Right} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="target" id="bottom" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" id="bottom" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="target" id="left" position={Position.Left} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />
      <Handle type="source" id="left" position={Position.Left} className="!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white" />

      {/* Delete button */}
      {isHovered && !isEditing && (
        <button
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 cursor-pointer leading-none z-10"
          onClick={(e) => {
            e.stopPropagation();
            deleteNode(id);
          }}
        >
          x
        </button>
      )}

      {/* Label or edit input */}
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-14 text-center text-xs text-gray-800 border-none outline-none bg-transparent"
        />
      ) : (
        <span className="text-xs text-gray-800 select-none truncate max-w-[52px]">{data.label}</span>
      )}
    </div>
  );
}
