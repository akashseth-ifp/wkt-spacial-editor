import { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import Konva from 'konva';
import { Plus, Minus, Pentagon } from 'lucide-react';

export const GridSection = () => {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
    const layer = layerRef.current;
    if (!stage || !layer) return;

    const oldScale = scale;
    const pointer = stage.getPointerPosition();
    
    if (!pointer) return;

    const newScale = e.evt.deltaY > 0 ? oldScale * 0.9 : oldScale * 1.1;
    const clampedScale = Math.max(0.1, Math.min(newScale, 5));

    // Calculate new offset to zoom towards cursor
    const newOffsetX = pointer.x - (pointer.x - offsetX) * (clampedScale / oldScale);
    const newOffsetY = pointer.y - (pointer.y - offsetY) * (clampedScale / oldScale);

    setScale(clampedScale);
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
  };

  // Zoom in button
  const handleZoomIn = () => {
    const oldScale = scale;
    const newScale = Math.min(oldScale * 1.2, 5);
    setScale(newScale);
  };

  // Zoom out button
  const handleZoomOut = () => {
    const oldScale = scale;
    const newScale = Math.max(oldScale * 0.8, 0.1);
    setScale(newScale);
  };

  // Pan handler with mouse drag
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === stageRef.current) {
      const stage = stageRef.current;
      if (!stage) return;

      let isPanning = true;
      const startX = e.evt.clientX;
      const startY = e.evt.clientY;
      const startOffsetX = offsetX;
      const startOffsetY = offsetY;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!isPanning) return;
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;
        
        setOffsetX(startOffsetX + deltaX);
        setOffsetY(startOffsetY + deltaY);
      };

      const handleMouseUp = () => {
        isPanning = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  // Render grid lines
  const renderGrid = (gridSize: number = 50) => {
    const lines = [];
    const visibleStartX = -offsetX / scale;
    const visibleStartY = -offsetY / scale;
    const visibleEndX = visibleStartX + dimensions.width / scale;
    const visibleEndY = visibleStartY + dimensions.height / scale;

    const startX = Math.floor(visibleStartX / gridSize) * gridSize;
    const startY = Math.floor(visibleStartY / gridSize) * gridSize;
    const endX = Math.ceil(visibleEndX / gridSize) * gridSize;
    const endY = Math.ceil(visibleEndY / gridSize) * gridSize;

    // Vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, startY, x, endY]}
          stroke="#e0e0e0"
          strokeWidth={1 / scale}
        />
      );
    }

    // Horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[startX, y, endX, y]}
          stroke="#e0e0e0"
          strokeWidth={1 / scale}
        />
      );
    }

    return lines;
  };

  return (
    <div className="w-full h-[70%] bg-white overflow-hidden relative">
      <Stage
        ref={stageRef}
        width={dimensions.width}
        height={dimensions.height}
        onWheel={handleZoom}
        onMouseDown={handleMouseDown}
      >
        <Layer
          ref={layerRef}
          scaleX={scale}
          scaleY={scale}
          x={offsetX}
          y={offsetY}
        >
          {renderGrid(50)}
        </Layer>
      </Stage>

      {/* Control Buttons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow-lg transition"
          title="Zoom In"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded shadow-lg transition"
          title="Zoom Out"
        >
          <Minus size={20} />
        </button>
        <button
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded shadow-lg transition"
          title="Draw Polygon"
        >
          <Pentagon size={20} />
        </button>
      </div>
    </div>
  );
};

export default GridSection;