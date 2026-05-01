import type { Point } from "@/lib/utils";

export type EdgeOverlay = {
  id: string;
  start: Point;
  end: Point;
  midpoint: Point;
  labelPosition: Point;
  length: number;
  label: string;
};
