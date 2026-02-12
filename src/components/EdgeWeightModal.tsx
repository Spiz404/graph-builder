import { useState, useCallback, useEffect, type KeyboardEvent } from 'react';
import { useGraphStore } from '../store/graphStore';

interface EdgeWeightModalProps {
  edgeId: string;
  currentWeight: number;
  position: { x: number; y: number };
  onClose: () => void;
}

export default function EdgeWeightModal({
  edgeId,
  currentWeight,
  position,
  onClose,
}: EdgeWeightModalProps) {
  const [weight, setWeight] = useState(String(currentWeight));
  const updateEdgeWeight = useGraphStore((s) => s.updateEdgeWeight);
  const deleteEdge = useGraphStore((s) => s.deleteEdge);

  const handleSave = useCallback(() => {
    const parsed = parseFloat(weight);
    if (!isNaN(parsed)) {
      updateEdgeWeight(edgeId, parsed);
    }
    onClose();
  }, [weight, edgeId, updateEdgeWeight, onClose]);

  const handleDelete = useCallback(() => {
    deleteEdge(edgeId);
    onClose();
  }, [edgeId, deleteEdge, onClose]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSave();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [handleSave, onClose]
  );

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.edge-weight-modal')) {
        onClose();
      }
    };
    // Delay to prevent the click that opened the modal from immediately closing it
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
    };
  }, [onClose]);

  return (
    <div
      className="edge-weight-modal absolute z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3 flex flex-col gap-2"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%) translateY(-8px)',
      }}
    >
      <label className="text-xs text-gray-500 font-medium">Edge Weight</label>
      <input
        type="number"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      />
      <div className="flex gap-1">
        <button
          onClick={handleSave}
          className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          Save
        </button>
        <button
          onClick={handleDelete}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
