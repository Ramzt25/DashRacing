export interface LocationCoordinates {
    latitude: number;
    longitude: number;
}
export interface NearbyRacer {
    id: string;
    username: string;
    location: LocationCoordinates;
    distance: number;
    lastSeen: Date;
    car: {
        make: string;
        model: string;
        year: number;
    };
    status: 'online' | 'racing' | 'idle';
}
export interface RaceRoute {
    id: string;
    name: string;
    description: string;
    distance: number;
    estimatedTime: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
    coordinates: LocationCoordinates[];
    waypoints: Array<{
        name: string;
        location: LocationCoordinates;
        type: 'start' | 'checkpoint' | 'finish';
    }>;
    elevation: {
        gain: number;
        loss: number;
        profile: Array<{
            distance: number;
            elevation: number;
        }>;
    };
}
export interface DirectionsResult {
    routes: Array<{
        distance: number;
        duration: number;
        polyline: string;
        steps: Array<{
            instruction: string;
            distance: number;
            duration: number;
            startLocation: LocationCoordinates;
            endLocation: LocationCoordinates;
        }>;
    }>;
    status: string;
}
export interface TrafficInfo {
    overallCondition: 'light' | 'moderate' | 'heavy' | 'severe';
    averageSpeed: number;
    congestionAreas: Array<{
        location: LocationCoordinates;
        severity: 'light' | 'moderate' | 'heavy';
        duration: number;
    }>;
    estimatedDelay: number;
    alternativeRoutes: number;
}
export interface PlaceResult {
    id: string;
    name: string;
    location: LocationCoordinates;
    address: string;
    rating: number;
    type: string;
    distance: number;
    phoneNumber?: string;
    website?: string;
    openingHours?: string[];
}
export interface LocationTrackingSession {
    sessionId: string;
    userId: string;
    raceId?: string;
    startTime: Date;
    isActive: boolean;
    options: {
        highAccuracy: boolean;
        distanceFilter: number;
        timeInterval: number;
    };
    lastLocation?: LocationCoordinates;
    totalDistance: number;
    trackPoints: Array<{
        location: LocationCoordinates;
        timestamp: Date;
        speed?: number;
        heading?: number;
    }>;
}
export declare class GoogleMapsService {
    private static readonly API_KEY;
    private static readonly GEOCODING_URL;
    private static readonly DIRECTIONS_URL;
    private static readonly PLACES_URL;
    private static readonly ELEVATION_URL;
    private static trackingSessions;
    /**
     * Geocode an address to coordinates
     */
    static geocodeAddress(address: string): Promise<LocationCoordinates | null>;
    /**
     * Reverse geocode coordinates to address
     */
    static reverseGeocode(latitude: number, longitude: number): Promise<string | null>;
    /**
     * Get nearby racers within radius
     */
    static getNearbyRacers(latitude: number, longitude: number, radius?: number): Promise<NearbyRacer[]>;
    /**
     * Get race routes between two points
     */
    static getRaceRoutes(startLat: number, startLng: number, endLat: number, endLng: number): Promise<RaceRoute[]>;
    /**
     * Get directions between two points
     */
    static getDirections(origin: string, destination: string, mode?: 'driving' | 'walking' | 'bicycling' | 'transit'): Promise<DirectionsResult | null>;
    /**
     * Get traffic information for a route
     */
    static getTrafficInfo(route: LocationCoordinates[]): Promise<TrafficInfo>;
    /**
     * Search for nearby places
     */
    static searchNearbyPlaces(query: string, location?: string, radius?: number): Promise<PlaceResult[]>;
    /**
     * Get elevation data for route points
     */
    static getElevationData(route: LocationCoordinates[]): Promise<Array<{
        location: LocationCoordinates;
        elevation: number;
    }>>;
    /**
     * Get road conditions for a route
     */
    static getRoadConditions(route: LocationCoordinates[]): Promise<any>;
    /**
     * Start location tracking session
     */
    static startLocationTracking(userId: string, raceId?: string, options?: {
        highAccuracy?: boolean;
        distanceFilter?: number;
        timeInterval?: number;
    }): Promise<LocationTrackingSession>;
    /**
     * Stop location tracking session
     */
    static stopLocationTracking(userId: string, sessionId: string): Promise<LocationTrackingSession | null>;
    /**
     * Update location for tracking session
     */
    static updateTrackingLocation(sessionId: string, location: LocationCoordinates, speed?: number, heading?: number): Promise<boolean>;
    /**
     * Calculate distance between two coordinates (in meters)
     */
    private static calculateDistance;
    private static getMockGeocodeResult;
    private static getMockReverseGeocodeResult;
    private static getMockNearbyRacers;
    private static generateRaceRoutes;
    private static generateRouteCoordinates;
    private static getMockDirections;
    private static getMockTrafficInfo;
    private static getMockPlaceSearch;
    private static getMockElevationData;
    private static getMockRoadConditions;
    private static transformDirectionsResult;
    private static transformPlaceResults;
    private static transformElevationData;
}
//# sourceMappingURL=GoogleMapsService.d.ts.map