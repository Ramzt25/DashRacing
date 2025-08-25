// Backend GoogleMapsService - server-side implementation
export class GoogleMapsService {
    static API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';
    static GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
    static DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
    static PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
    static ELEVATION_URL = 'https://maps.googleapis.com/maps/api/elevation/json';
    // In-memory storage for tracking sessions (in production, use a database)
    static trackingSessions = new Map();
    /**
     * Geocode an address to coordinates
     */
    static async geocodeAddress(address) {
        try {
            if (!this.API_KEY) {
                console.warn('Google Maps API key not configured, using mock data');
                return this.getMockGeocodeResult(address);
            }
            const url = `${this.GEOCODING_URL}?address=${encodeURIComponent(address)}&key=${this.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Google Maps API error: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status !== 'OK' || !data.results.length) {
                return null;
            }
            const location = data.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng,
            };
        }
        catch (error) {
            console.warn('Geocoding failed, using mock data:', error);
            return this.getMockGeocodeResult(address);
        }
    }
    /**
     * Reverse geocode coordinates to address
     */
    static async reverseGeocode(latitude, longitude) {
        try {
            if (!this.API_KEY) {
                console.warn('Google Maps API key not configured, using mock data');
                return this.getMockReverseGeocodeResult(latitude, longitude);
            }
            const url = `${this.GEOCODING_URL}?latlng=${latitude},${longitude}&key=${this.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Google Maps API error: ${response.statusText}`);
            }
            const data = await response.json();
            if (data.status !== 'OK' || !data.results.length) {
                return null;
            }
            return data.results[0].formatted_address;
        }
        catch (error) {
            console.warn('Reverse geocoding failed, using mock data:', error);
            return this.getMockReverseGeocodeResult(latitude, longitude);
        }
    }
    /**
     * Get nearby racers within radius
     */
    static async getNearbyRacers(latitude, longitude, radius = 5000) {
        try {
            // In production, this would query a real-time database of active racers
            // For now, return mock data based on location
            return this.getMockNearbyRacers(latitude, longitude, radius);
        }
        catch (error) {
            console.warn('Failed to get nearby racers:', error);
            return [];
        }
    }
    /**
     * Get race routes between two points
     */
    static async getRaceRoutes(startLat, startLng, endLat, endLng) {
        try {
            // Generate multiple route options for racing
            return this.generateRaceRoutes(startLat, startLng, endLat, endLng);
        }
        catch (error) {
            console.warn('Failed to get race routes:', error);
            return [];
        }
    }
    /**
     * Get directions between two points
     */
    static async getDirections(origin, destination, mode = 'driving') {
        try {
            if (!this.API_KEY) {
                console.warn('Google Maps API key not configured, using mock data');
                return this.getMockDirections(origin, destination, mode);
            }
            const url = `${this.DIRECTIONS_URL}?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${this.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Google Maps API error: ${response.statusText}`);
            }
            const data = await response.json();
            return this.transformDirectionsResult(data);
        }
        catch (error) {
            console.warn('Directions failed, using mock data:', error);
            return this.getMockDirections(origin, destination, mode);
        }
    }
    /**
     * Get traffic information for a route
     */
    static async getTrafficInfo(route) {
        try {
            // In production, this would use Google Maps Traffic API
            return this.getMockTrafficInfo(route);
        }
        catch (error) {
            console.warn('Failed to get traffic info:', error);
            return this.getMockTrafficInfo(route);
        }
    }
    /**
     * Search for nearby places
     */
    static async searchNearbyPlaces(query, location, radius = 5000) {
        try {
            if (!this.API_KEY) {
                console.warn('Google Maps API key not configured, using mock data');
                return this.getMockPlaceSearch(query, location, radius);
            }
            // For location-based search, we need coordinates
            let coordinates = null;
            if (location) {
                coordinates = await this.geocodeAddress(location);
            }
            if (!coordinates && location) {
                // If geocoding failed, use mock data
                return this.getMockPlaceSearch(query, location, radius);
            }
            const url = coordinates
                ? `${this.PLACES_URL}?location=${coordinates.latitude},${coordinates.longitude}&radius=${radius}&keyword=${encodeURIComponent(query)}&key=${this.API_KEY}`
                : `${this.PLACES_URL}?keyword=${encodeURIComponent(query)}&key=${this.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Google Maps API error: ${response.statusText}`);
            }
            const data = await response.json();
            return this.transformPlaceResults(data);
        }
        catch (error) {
            console.warn('Place search failed, using mock data:', error);
            return this.getMockPlaceSearch(query, location, radius);
        }
    }
    /**
     * Get elevation data for route points
     */
    static async getElevationData(route) {
        try {
            if (!this.API_KEY) {
                console.warn('Google Maps API key not configured, using mock data');
                return this.getMockElevationData(route);
            }
            const locations = route.map(point => `${point.latitude},${point.longitude}`).join('|');
            const url = `${this.ELEVATION_URL}?locations=${locations}&key=${this.API_KEY}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Google Maps API error: ${response.statusText}`);
            }
            const data = await response.json();
            return this.transformElevationData(data);
        }
        catch (error) {
            console.warn('Elevation data failed, using mock data:', error);
            return this.getMockElevationData(route);
        }
    }
    /**
     * Get road conditions for a route
     */
    static async getRoadConditions(route) {
        try {
            // This would integrate with road condition APIs in production
            return this.getMockRoadConditions(route);
        }
        catch (error) {
            console.warn('Failed to get road conditions:', error);
            return this.getMockRoadConditions(route);
        }
    }
    /**
     * Start location tracking session
     */
    static async startLocationTracking(userId, raceId, options) {
        const sessionId = `session_${userId}_${Date.now()}`;
        const trackingOptions = {
            highAccuracy: options?.highAccuracy ?? true,
            distanceFilter: options?.distanceFilter ?? 10, // meters
            timeInterval: options?.timeInterval ?? 1000, // milliseconds
        };
        const session = {
            sessionId,
            userId,
            raceId,
            startTime: new Date(),
            isActive: true,
            options: trackingOptions,
            totalDistance: 0,
            trackPoints: [],
        };
        this.trackingSessions.set(sessionId, session);
        return session;
    }
    /**
     * Stop location tracking session
     */
    static async stopLocationTracking(userId, sessionId) {
        const session = this.trackingSessions.get(sessionId);
        if (!session || session.userId !== userId) {
            return null;
        }
        session.isActive = false;
        this.trackingSessions.set(sessionId, session);
        return session;
    }
    /**
     * Update location for tracking session
     */
    static async updateTrackingLocation(sessionId, location, speed, heading) {
        const session = this.trackingSessions.get(sessionId);
        if (!session || !session.isActive) {
            return false;
        }
        const trackPoint = {
            location,
            timestamp: new Date(),
            speed,
            heading,
        };
        session.trackPoints.push(trackPoint);
        session.lastLocation = location;
        // Calculate distance from previous point
        if (session.trackPoints.length > 1) {
            const prevPoint = session.trackPoints[session.trackPoints.length - 2];
            const distance = this.calculateDistance(prevPoint.location, location);
            session.totalDistance += distance;
        }
        this.trackingSessions.set(sessionId, session);
        return true;
    }
    /**
     * Calculate distance between two coordinates (in meters)
     */
    static calculateDistance(coord1, coord2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = coord1.latitude * Math.PI / 180;
        const φ2 = coord2.latitude * Math.PI / 180;
        const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
        const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    // Mock data methods for development
    static getMockGeocodeResult(address) {
        // Return coordinates for common locations or generate based on address
        const mockLocations = {
            'new york': { latitude: 40.7128, longitude: -74.0060 },
            'los angeles': { latitude: 34.0522, longitude: -118.2437 },
            'chicago': { latitude: 41.8781, longitude: -87.6298 },
            'miami': { latitude: 25.7617, longitude: -80.1918 },
            'las vegas': { latitude: 36.1699, longitude: -115.1398 },
        };
        const normalized = address.toLowerCase();
        for (const [key, coords] of Object.entries(mockLocations)) {
            if (normalized.includes(key)) {
                return coords;
            }
        }
        // Generate pseudo-random coordinates based on address hash
        const hash = address.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        return {
            latitude: 40 + (hash % 100) / 100, // Roughly US latitude range
            longitude: -120 + (hash % 80) / 100, // Roughly US longitude range
        };
    }
    static getMockReverseGeocodeResult(latitude, longitude) {
        return `${Math.abs(latitude).toFixed(4)}°${latitude >= 0 ? 'N' : 'S'}, ${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? 'E' : 'W'}`;
    }
    static getMockNearbyRacers(lat, lng, radius) {
        const carMakes = ['Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Nissan', 'Toyota'];
        const carModels = ['Mustang', 'Camaro', 'M3', 'C63', 'RS4', 'GT-R', 'Supra'];
        const statuses = ['online', 'racing', 'idle'];
        return Array.from({ length: Math.floor(Math.random() * 8) + 2 }, (_, i) => ({
            id: `racer_${i + 1}`,
            username: `Racer${i + 1}`,
            location: {
                latitude: lat + (Math.random() - 0.5) * 0.01,
                longitude: lng + (Math.random() - 0.5) * 0.01,
            },
            distance: Math.floor(Math.random() * radius),
            lastSeen: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
            car: {
                make: carMakes[Math.floor(Math.random() * carMakes.length)],
                model: carModels[Math.floor(Math.random() * carModels.length)],
                year: 2020 + Math.floor(Math.random() * 5),
            },
            status: statuses[Math.floor(Math.random() * statuses.length)],
        }));
    }
    static generateRaceRoutes(startLat, startLng, endLat, endLng) {
        const distance = this.calculateDistance({ latitude: startLat, longitude: startLng }, { latitude: endLat, longitude: endLng });
        const routes = [];
        const routeTypes = [
            { name: 'Direct Route', difficulty: 'easy', factor: 1.0 },
            { name: 'Scenic Route', difficulty: 'medium', factor: 1.3 },
            { name: 'Challenge Route', difficulty: 'hard', factor: 1.1 },
        ];
        routeTypes.forEach((type, index) => {
            const routeDistance = distance * type.factor;
            routes.push({
                id: `route_${index + 1}`,
                name: type.name,
                description: `${type.name} from start to finish`,
                distance: routeDistance,
                estimatedTime: routeDistance / 20, // Rough estimate at 20 m/s average
                difficulty: type.difficulty,
                coordinates: this.generateRouteCoordinates(startLat, startLng, endLat, endLng, type.factor),
                waypoints: [
                    { name: 'Start', location: { latitude: startLat, longitude: startLng }, type: 'start' },
                    { name: 'Finish', location: { latitude: endLat, longitude: endLng }, type: 'finish' },
                ],
                elevation: {
                    gain: Math.floor(Math.random() * 200),
                    loss: Math.floor(Math.random() * 200),
                    profile: [],
                },
            });
        });
        return routes;
    }
    static generateRouteCoordinates(startLat, startLng, endLat, endLng, factor) {
        const points = Math.floor(10 * factor);
        const coordinates = [];
        for (let i = 0; i <= points; i++) {
            const progress = i / points;
            const lat = startLat + (endLat - startLat) * progress;
            const lng = startLng + (endLng - startLng) * progress;
            // Add some random variation for more realistic routes
            const variation = 0.001 * (factor - 1);
            coordinates.push({
                latitude: lat + (Math.random() - 0.5) * variation,
                longitude: lng + (Math.random() - 0.5) * variation,
            });
        }
        return coordinates;
    }
    static getMockDirections(origin, destination, mode) {
        return {
            routes: [{
                    distance: 15000 + Math.floor(Math.random() * 10000), // 15-25km
                    duration: 1200 + Math.floor(Math.random() * 600), // 20-30 minutes
                    polyline: 'mock_encoded_polyline',
                    steps: [
                        {
                            instruction: 'Head north on Main St',
                            distance: 500,
                            duration: 60,
                            startLocation: { latitude: 40.7128, longitude: -74.0060 },
                            endLocation: { latitude: 40.7178, longitude: -74.0060 },
                        },
                        {
                            instruction: 'Turn right onto Highway 1',
                            distance: 2000,
                            duration: 180,
                            startLocation: { latitude: 40.7178, longitude: -74.0060 },
                            endLocation: { latitude: 40.7178, longitude: -73.9860 },
                        },
                    ],
                }],
            status: 'OK',
        };
    }
    static getMockTrafficInfo(route) {
        const conditions = ['light', 'moderate', 'heavy', 'severe'];
        return {
            overallCondition: conditions[Math.floor(Math.random() * conditions.length)],
            averageSpeed: 45 + Math.random() * 30,
            congestionAreas: route.slice(0, Math.floor(Math.random() * 3)).map(location => ({
                location,
                severity: conditions[Math.floor(Math.random() * 3)],
                duration: Math.floor(Math.random() * 600),
            })),
            estimatedDelay: Math.floor(Math.random() * 300),
            alternativeRoutes: Math.floor(Math.random() * 3) + 1,
        };
    }
    static getMockPlaceSearch(query, location, radius) {
        const places = [
            'Gas Station', 'Auto Parts Store', 'Car Wash', 'Tire Shop', 'Restaurant',
            'Coffee Shop', 'Parking Garage', 'Hotel', 'Shopping Center', 'Bank'
        ];
        return places.slice(0, Math.floor(Math.random() * 5) + 3).map((place, index) => ({
            id: `place_${index + 1}`,
            name: `${place} ${index + 1}`,
            location: {
                latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
                longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
            },
            address: `${Math.floor(Math.random() * 9999)} Main St, City, State`,
            rating: 3.5 + Math.random() * 1.5,
            type: place.toLowerCase().replace(' ', '_'),
            distance: Math.floor(Math.random() * (radius || 5000)),
            phoneNumber: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        }));
    }
    static getMockElevationData(route) {
        return route.map(location => ({
            location,
            elevation: 100 + Math.random() * 500, // 100-600m elevation
        }));
    }
    static getMockRoadConditions(route) {
        return {
            overall: 'good',
            conditions: route.map((location, index) => ({
                location,
                surface: 'asphalt',
                quality: Math.random() > 0.2 ? 'good' : 'fair',
                weather: 'clear',
                visibility: 'excellent',
            })),
        };
    }
    static transformDirectionsResult(data) {
        if (!data.routes || data.routes.length === 0) {
            return { routes: [], status: data.status || 'NO_ROUTES' };
        }
        return {
            routes: data.routes.map((route) => ({
                distance: route.legs.reduce((total, leg) => total + leg.distance.value, 0),
                duration: route.legs.reduce((total, leg) => total + leg.duration.value, 0),
                polyline: route.overview_polyline.points,
                steps: route.legs.flatMap((leg) => leg.steps.map((step) => ({
                    instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
                    distance: step.distance.value,
                    duration: step.duration.value,
                    startLocation: {
                        latitude: step.start_location.lat,
                        longitude: step.start_location.lng,
                    },
                    endLocation: {
                        latitude: step.end_location.lat,
                        longitude: step.end_location.lng,
                    },
                }))),
            })),
            status: data.status,
        };
    }
    static transformPlaceResults(data) {
        if (!data.results)
            return [];
        return data.results.map((result) => ({
            id: result.place_id,
            name: result.name,
            location: {
                latitude: result.geometry.location.lat,
                longitude: result.geometry.location.lng,
            },
            address: result.vicinity || result.formatted_address,
            rating: result.rating || 0,
            type: result.types?.[0] || 'establishment',
            distance: 0, // Would be calculated based on user location
        }));
    }
    static transformElevationData(data) {
        if (!data.results)
            return [];
        return data.results.map((result) => ({
            location: {
                latitude: result.location.lat,
                longitude: result.location.lng,
            },
            elevation: result.elevation,
        }));
    }
}
//# sourceMappingURL=GoogleMapsService.js.map