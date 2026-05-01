import { useState } from 'react';
import { Circle, Group, Line, Rect, Text } from 'react-konva';
import { VertexPoint } from './VertexPoint';
import type { Point } from '@/lib/utils';
import type { EdgeOverlay } from '@/types/utils';

type PolygonEditorProps = {
  points: Point[];
  edgeOverlays: EdgeOverlay[];
  scale: number;
  selectedEdgeIds: Set<string>;
  onEdgeToggle: (edgeId: string) => void;
  onVertexDrag: (index: number, pointer: { x: number; y: number }) => void;
};

const arePointsEqual = (a: Point, b: Point) => a.x === b.x && a.y === b.y;

const getPolygonVertices = (points: Point[]) => {
  if (points.length < 2) return points;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  return arePointsEqual(firstPoint, lastPoint) ? points.slice(0, -1) : points;
};

export const PolygonEditor = ({
  points,
  edgeOverlays,
  scale,
  selectedEdgeIds,
  onEdgeToggle,
  onVertexDrag,
}: PolygonEditorProps) => {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const vertices = getPolygonVertices(points);
  const fontSize = 13 / scale;
  const checkboxRadius = 10 / scale;
  const highlightStrokeWidth = 4 / scale;

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
        points={vertices.flatMap(point => [point.x, point.y])}
        closed
        stroke="#2563eb"
        strokeWidth={2 / scale}
        fill="rgba(37, 99, 235, 0.12)"
      />
      {edgeOverlays.map((edge) => {
        const isSelected = selectedEdgeIds.has(edge.id);
        const labelWidth = edge.label.length * fontSize * 0.65 + 14 / scale;
        const labelHeight = fontSize + 10 / scale;

        return (
          <Group key={edge.id}>
            {isSelected && (
              <Line
                points={[edge.start.x, edge.start.y, edge.end.x, edge.end.y]}
                stroke="#f97316"
                strokeWidth={highlightStrokeWidth}
                lineCap="round"
              />
            )}
            <Group
              name="edge-checkbox"
              x={edge.midpoint.x}
              y={edge.midpoint.y}
              onMouseDown={(e) => {
                e.cancelBubble = true;
              }}
              onClick={(e) => {
                e.cancelBubble = true;
                onEdgeToggle(edge.id);
              }}
              onTap={(e) => {
                e.cancelBubble = true;
                onEdgeToggle(edge.id);
              }}
              onMouseEnter={(e) => {
                e.target.getStage()!.container().style.cursor = 'pointer';
              }}
              onMouseLeave={(e) => {
                e.target.getStage()!.container().style.cursor = 'default';
              }}
            >
              <Circle
                radius={checkboxRadius}
                fill="#ffffff"
                stroke={isSelected ? '#f97316' : '#475569'}
                strokeWidth={2 / scale}
              />
              {isSelected && (
                <Line
                  points={[
                    -4 / scale,
                    0,
                    -1 / scale,
                    4 / scale,
                    5 / scale,
                    -4 / scale,
                  ]}
                  stroke="#f97316"
                  strokeWidth={2 / scale}
                  lineCap="round"
                  lineJoin="round"
                />
              )}
            </Group>
            <Group x={edge.labelPosition.x} y={edge.labelPosition.y} listening={false}>
              <Rect
                x={-labelWidth / 2}
                y={-labelHeight / 2}
                width={labelWidth}
                height={labelHeight}
                cornerRadius={6 / scale}
                fill="rgba(255, 255, 255, 0.92)"
                stroke="#cbd5e1"
                strokeWidth={1 / scale}
              />
              <Text
                x={-labelWidth / 2}
                y={-labelHeight / 2}
                width={labelWidth}
                height={labelHeight}
                align="center"
                verticalAlign="middle"
                text={edge.label}
                fontSize={fontSize}
                fill="#0f172a"
              />
            </Group>
          </Group>
        );
      })}
      {vertices.map((point, index) => (
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
