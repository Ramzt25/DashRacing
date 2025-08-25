import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { Feature, Polygon, Point, GeoJsonProperties } from 'geojson';

export function insideVenue(lon: number, lat: number, polygonJson: any): boolean {
  const point: Feature<Point> = { 
    type: 'Feature', 
    geometry: { type: 'Point', coordinates: [lon, lat] }, 
    properties: {} 
  };
  const polygon: Feature<Polygon> = { 
    type: 'Feature', 
    geometry: polygonJson as Polygon, 
    properties: {} 
  };
  return booleanPointInPolygon(point, polygon);
}
