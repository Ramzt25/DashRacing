import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
export function insideVenue(lon, lat, polygonJson) {
    const point = {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {}
    };
    const polygon = {
        type: 'Feature',
        geometry: polygonJson,
        properties: {}
    };
    return booleanPointInPolygon(point, polygon);
}
//# sourceMappingURL=geofence.js.map