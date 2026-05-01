declare module 'wellknown' {
  export interface GeometryObject {
    type: string;
    coordinates?: unknown;
  }

  export function parse(wkt: string): GeometryObject | null;
  export function stringify(geometry: GeometryObject): string;
}
