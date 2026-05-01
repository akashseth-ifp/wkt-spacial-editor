import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import * as wkt from 'wellknown';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SCALE_FACTOR = 50;

// Type for point coordinates
export interface Point {
  x: number;
  y: number;
}

/**
 * Convert WKT Polygon string to array of Points for react-konva rendering
 * @param wktPolygon - WKT format string, e.g., "POLYGON ((-64.8 32.3, -65.5 18.3, -80.3 25.2, -64.8 32.3))"
 * @returns Array of Point objects with x and y coordinates
 */
export function wktToPoints(wktPolygon: string): Point[] {
  const parsed = wkt.parse(wktPolygon);
  
  if (!parsed || parsed.type !== 'Polygon') {
    throw new Error('Invalid WKT Polygon format');
  }

  // Extract coordinates from the first ring (outer ring)
  const coordinates = parsed.coordinates[0];
  
  // Convert [longitude, latitude] to Point objects
  const points: Point[] = coordinates.map(([x, y]) => ({
    x,
    y,
  }));

  return points;
}

/**
 * Convert array of Points to WKT Polygon string
 * @param points - Array of Point objects with x and y coordinates
 * @returns WKT Polygon format string
 */
export function pointsToWkt(points: Point[]): string {
  try {
    if (points.length < 3) {
      throw new Error('At least 3 points are required to form a polygon');
    }

    // Close the polygon by adding the first point at the end if not already closed
    const closedPoints = [...points];
    const firstPoint = closedPoints[0];
    const lastPoint = closedPoints[closedPoints.length - 1];

    if (firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y) {
      closedPoints.push(firstPoint);
    }

    // Convert Points to [x, y] coordinate pairs
    const coordinates = closedPoints.map(point => [point.x, point.y]);

    // Create WKT Polygon object
    const polygonObject = {
      type: 'Polygon',
      coordinates: [coordinates],
    };

    // Convert to WKT string using wellknown
    const wktString = wkt.stringify(polygonObject);

    return wktString;
  } catch (error) {
    console.error('Error converting points to WKT:', error);
    return '';
  }
}

/**
 * Unscale canvas points back to geographic coordinates
 * @param scaledPoints - Array of scaled Point objects from canvas
 * @param scaleFactor - The scale factor 
 * @returns Array of unscaled Point objects with original geographic coordinates
 */
export function unscalePoints(scaledPoints: Point[], scaleFactor: number = SCALE_FACTOR): Point[] {
  return scaledPoints.map(point => ({
    x: point.x / scaleFactor,
    y: point.y / scaleFactor,
  }));
}

/**
 * Convert canvas Points (after unscaling) back to WKT Polygon
 * @param canvasPoints - Array of Point objects from canvas drawing
 * @param scaleFactor - The scale factor used (default: 50)
 * @returns WKT Polygon format string
 */
export function canvasPointsToWkt(canvasPoints: Point[], scaleFactor: number = SCALE_FACTOR): string {
  const unscaledPoints = unscalePoints(canvasPoints, scaleFactor);
  return pointsToWkt(unscaledPoints);
}

