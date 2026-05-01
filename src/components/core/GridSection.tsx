import { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { Plus, Minus } from 'lucide-react';
import { WKTErrorAlert } from '@/components/custom/WKTErrorAlert';
import { PolygonEditor } from '@/components/custom/PolygonEditor';
import { SCALE_FACTOR, wktToPoints, canvasPointsToWkt, type Point } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type GridSectionProps = {
  polygonString: string;
  onPolygonChange: (wkt: string) => void;
};

type ViewState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

type EditorState = {
  sourcePolygon: string;
  editablePoints: Point[];
  view: ViewState;
};

const EDGE_PAN_THRESHOLD = 48;
const EDGE_PAN_STEP = 18;

const scalePoints = (points: Point[]): Point[] =>
  points.map(point => ({
    x: point.x * SCALE_FACTOR,
    y: point.y * SCALE_FACTOR,
  }));

const computeAutoFit = (
  points: Point[],
  dimensions: { width: number; height: number }
): ViewState => {
  if (points.length === 0) return { scale: 1, offsetX: 0, offsetY: 0 };

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));
  const maxY = Math.max(...points.map(p => p.y));

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const paddingPixels = 100;
  const polygonWidth = maxX - minX + paddingPixels;
  const polygonHeight = maxY - minY + paddingPixels;

  const gridHeight = dimensions.height * 0.7;
  const gridWidth = dimensions.width;

  const zoomLevel = Math.min(gridWidth / polygonWidth, gridHeight / polygonHeight);

  return {
    scale: Math.min(zoomLevel, 2),
    offsetX: gridWidth / 2 - centerX * zoomLevel,
    offsetY: gridHeight / 2 - centerY * zoomLevel,
  };
};

export const GridSection = ({ polygonString, onPolygonChange }: GridSectionProps) => {
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const parsingResult = useMemo(() => {
    if (!polygonString) {
      return { points: [], error: null };
    }
    try {
      return { points: wktToPoints(polygonString), error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse WKT data';
      return { points: [], error: errorMessage };
    }
  }, [polygonString]);

  const rawPoints = parsingResult.points;
  const parseError = parsingResult.error;

  const points = useMemo(() => scalePoints(rawPoints), [rawPoints]);
  const initialView = useMemo(
    () => computeAutoFit(points, dimensions),
    [dimensions, points]
  );
  const [editorState, setEditorState] = useState<EditorState>(() => ({
    sourcePolygon: polygonString,
    editablePoints: points,
    view: initialView,
  }));

  if (editorState.sourcePolygon !== polygonString) {
    setEditorState({
      sourcePolygon: polygonString,
      editablePoints: points,
      view: initialView,
    });
  }

  const { editablePoints, view } = editorState;

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Zoom handler
  const handleZoom = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    setEditorState(prev => {
      const newScale = Math.max(
        0.1,
        Math.min(e.evt.deltaY > 0 ? prev.view.scale * 0.9 : prev.view.scale * 1.1, 5)
      );
      return {
        ...prev,
        view: {
          scale: newScale,
          offsetX: pointer.x - (pointer.x - prev.view.offsetX) * (newScale / prev.view.scale),
          offsetY: pointer.y - (pointer.y - prev.view.offsetY) * (newScale / prev.view.scale),
        },
      };
    });
  };

  const handleZoomIn = () => {
    setEditorState(prev => {
      const gridHeight = dimensions.height * 0.7;
      const gridWidth = dimensions.width;
      const gridCenterX = gridWidth / 2;
      const gridCenterY = gridHeight / 2;

      const newScale = Math.min(prev.view.scale * 1.2, 5);
      return {
        ...prev,
        view: {
          scale: newScale,
          offsetX: gridCenterX - (gridCenterX - prev.view.offsetX) * (newScale / prev.view.scale),
          offsetY: gridCenterY - (gridCenterY - prev.view.offsetY) * (newScale / prev.view.scale),
        },
      };
    });
  };

  const handleZoomOut = () => {
    setEditorState(prev => {
      const gridHeight = dimensions.height * 0.7;
      const gridWidth = dimensions.width;
      const gridCenterX = gridWidth / 2;
      const gridCenterY = gridHeight / 2;

      const newScale = Math.max(prev.view.scale * 0.8, 0.1);
      return {
        ...prev,
        view: {
          scale: newScale,
          offsetX: gridCenterX - (gridCenterX - prev.view.offsetX) * (newScale / prev.view.scale),
          offsetY: gridCenterY - (gridCenterY - prev.view.offsetY) * (newScale / prev.view.scale),
        },
      };
    });
  };

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target.draggable?.()) return;

    let isPanning = true;
    const startX = e.evt.clientX;
    const startY = e.evt.clientY;
    const startOffsetX = view.offsetX;
    const startOffsetY = view.offsetY;

    document.body.style.cursor = 'grabbing';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isPanning) return;
      setEditorState(prev => ({
        ...prev,
        view: {
          ...prev.view,
          offsetX: startOffsetX + (moveEvent.clientX - startX),
          offsetY: startOffsetY + (moveEvent.clientY - startY),
        },
      }));
    };

    const handleMouseUp = () => {
      isPanning = false;
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const renderGrid = (gridSize = 50) => {
    const lines = [];
    const visibleStartX = -view.offsetX / view.scale;
    const visibleStartY = -view.offsetY / view.scale;
    const visibleEndX = visibleStartX + dimensions.width / view.scale;
    const visibleEndY = visibleStartY + dimensions.height / view.scale;

    const startX = Math.floor(visibleStartX / gridSize) * gridSize;
    const startY = Math.floor(visibleStartY / gridSize) * gridSize;
    const endX = Math.ceil(visibleEndX / gridSize) * gridSize;
    const endY = Math.ceil(visibleEndY / gridSize) * gridSize;

    for (let x = startX; x <= endX; x += gridSize) {
      lines.push(
        <Line key={`v-${x}`} points={[x, startY, x, endY]} stroke="#e0e0e0" strokeWidth={1 / view.scale} />
      );
    }

    for (let y = startY; y <= endY; y += gridSize) {
      lines.push(
        <Line key={`h-${y}`} points={[startX, y, endX, y]} stroke="#e0e0e0" strokeWidth={1 / view.scale} />
      );
    }

    return lines;
  };

  const handleVertexDrag = (index: number, pointer: { x: number; y: number }) => {
    setEditorState((prev) => {
      let panX = 0;
      let panY = 0;

      if (pointer.x < EDGE_PAN_THRESHOLD) {
        panX = EDGE_PAN_STEP;
      } else if (pointer.x > dimensions.width - EDGE_PAN_THRESHOLD) {
        panX = -EDGE_PAN_STEP;
      }

      if (pointer.y < EDGE_PAN_THRESHOLD) {
        panY = EDGE_PAN_STEP;
      } else if (pointer.y > dimensions.height - EDGE_PAN_THRESHOLD) {
        panY = -EDGE_PAN_STEP;
      }

      const nextView = {
        ...prev.view,
        offsetX: prev.view.offsetX + panX,
        offsetY: prev.view.offsetY + panY,
      };

      const nextPoint = {
        x: (pointer.x - nextView.offsetX) / nextView.scale,
        y: (pointer.y - nextView.offsetY) / nextView.scale,
      };

      const nextPoints = [...prev.editablePoints];
      nextPoints[index] = nextPoint;

      if (index === 0) {
        nextPoints[nextPoints.length - 1] = nextPoint;
      } else if (index === nextPoints.length - 1) {
        nextPoints[0] = nextPoint;
      }

      return {
        ...prev,
        editablePoints: nextPoints,
        view: nextView,
      };
    });
  };

  const handleUpdatePolygon = () => {
    if (parseError || editablePoints.length < 3) return;

    const nextWkt = canvasPointsToWkt(editablePoints, SCALE_FACTOR);
    if (nextWkt) {
      onPolygonChange(nextWkt);
    }
  };

  return (
    <div className="w-full h-[70%] bg-white overflow-hidden relative">
      {/* Alert positioned outside Stage to avoid z-index issues */}
      {parseError && (
        <WKTErrorAlert 
          message={parseError} 
          onClose={() => {}} 
        />
      )}

      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleZoom}
        onMouseDown={handleMouseDown}
      >
        <Layer
          ref={layerRef}
          scaleX={view.scale}
          scaleY={view.scale}
          x={view.offsetX}
          y={view.offsetY}
        >
          {renderGrid(50)}
          {editablePoints.length > 0 && (
            <PolygonEditor
              points={editablePoints}
              scale={view.scale}
              onVertexDrag={handleVertexDrag}
            />
          )}
        </Layer>
      </Stage>

      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <button onClick={handleZoomIn} className="flex h-10 w-10 items-center justify-center rounded bg-blue-500 text-white shadow-lg transition hover:bg-blue-600" title="Zoom In">
          <Plus size={20} />
        </button>
        <button onClick={handleZoomOut} className="flex h-10 w-10 items-center justify-center rounded bg-blue-500 text-white shadow-lg transition hover:bg-blue-600" title="Zoom Out">
          <Minus size={20} />
        </button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white shadow-lg"
          disabled={Boolean(parseError) || editablePoints.length < 3}
          onClick={handleUpdatePolygon}
        >
          Update WKT
        </Button>
      </div>
    </div>
  );
};

export default GridSection;
