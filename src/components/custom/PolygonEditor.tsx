import { useState } from 'react';
import { Line } from 'react-konva';
import { VertexPoint } from './VertexPoint';
import type { Point } from '@/lib/utils';

type PolygonEditorProps = {
  points: Point[];
  scale: number;
  onVertexDrag: (index: number, pointer: { x: number; y: number }) => void;
};

export const PolygonEditor = ({ points, scale, onVertexDrag }: PolygonEditorProps) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDragMove = (index: number, pointer: { x: number; y: number }) => {
    onVertexDrag(index, pointer);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  return (
    <>
      <Line
        points={points.flatMap(p => [p.x, p.y])}
        closed
        stroke="blue"
        strokeWidth={2 / scale}
        fill="rgba(0, 0, 255, 0.1)"
      />
      {points.slice(0, -1).map((point, index) => (
        <VertexPoint
          key={`vertex-${index}`}
          x={point.x}
          y={point.y}
          index={index}
          isDragging={draggingIndex === index}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          scale={scale}
        />
      ))}
    </>
  );
};

export default PolygonEditor;
