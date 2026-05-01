import { Circle } from 'react-konva';
import Konva from 'konva';

type VertexPointProps = {
  x: number;
  y: number;
  index: number;
  isDragging: boolean;
  onDragStart: (index: number) => void;
  onDragMove: (index: number, pointer: { x: number; y: number }) => void;
  onDragEnd: (index: number) => void;
  scale: number;
};

export const VertexPoint = ({
  x,
  y,
  index,
  isDragging,
  onDragStart,
  onDragMove,
  onDragEnd,
  scale,
}: VertexPointProps) => {
  const handleDragStart = () => {
    onDragStart(index);
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const pointer = e.target.getStage()?.getPointerPosition();
    if (!pointer) return;

    onDragMove(index, pointer);
  };

  const handleDragEnd = () => {
    onDragEnd(index);
  };

  return (
    <Circle
      x={x}
      y={y}
      radius={6 / scale}
      fill={isDragging ? '#ff6b6b' : '#0066ff'}
      stroke="#fff"
      strokeWidth={2 / scale}
      draggable
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onMouseEnter={(e) => {
        e.target.getStage()!.container().style.cursor = 'pointer';
      }}
      onMouseLeave={(e) => {
        e.target.getStage()!.container().style.cursor = 'default';
      }}
    />
  );
};

export default VertexPoint;
