import { prisma } from '../prisma.js';
import { authGuard } from '../auth.js';
import { z } from 'zod';
export async function registerLiveMapRoutes(app) {
    // Get nearby events and users
    app.get('/livemap/nearby', { preHandler: [authGuard] }, async (req) => {
        const { lat, lon, radius = 25 } = req.query;
        if (!lat || !lon) {
            return { events: [], users: [] };
        }
        try {
            // Get nearby events (simplified - without exact distance calculation)
            const events = await prisma.event.findMany({
                where: {
                    AND: [
                        { locationLat: { not: null } },
                        { locationLon: { not: null } },
                        { status: 'upcoming' },
                        { startTime: { gte: new Date() } },
                        { startTime: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } }, // Next 24 hours
                    ],
                },
                include: {
                    _count: {
                        select: {
                            attendances: true,
                        },
                    },
                },
                take: 20,
            });
            // Get current user's location for privacy check
            const currentUser = await prisma.user.findUnique({
                where: { id: req.user.sub },
            });
            // Simple nearby users (in a real app, you'd have location tracking)
            const nearbyUsers = await prisma.user.findMany({
                where: {
                    AND: [
                        { presenceMode: { not: 'OFF' } },
                        { id: { not: req.user.sub } },
                    ],
                },
                select: {
                    id: true,
                    handle: true,
                    displayName: true,
                    presenceMode: true,
                },
                take: 10,
            });
            return {
                events: events.map(event => ({
                    id: event.id,
                    title: event.title,
                    eventType: event.eventType,
                    startTime: event.startTime,
                    location: {
                        name: event.locationName,
                        lat: event.locationLat,
                        lon: event.locationLon,
                    },
                    participantCount: event._count.attendances,
                })),
                users: nearbyUsers.map(user => ({
                    id: user.id,
                    handle: user.handle,
                    displayName: user.displayName,
                    presenceMode: user.presenceMode,
                    // In a real app, you'd include actual location data
                    location: {
                        lat: lat + (Math.random() - 0.5) * 0.01, // Simulate nearby location
                        lon: lon + (Math.random() - 0.5) * 0.01,
                    },
                })),
            };
        }
        catch (error) {
            console.error('Error fetching nearby data:', error);
            return { events: [], users: [] };
        }
    });
    // Update user location and presence
    const UpdateLocationSchema = z.object({
        lat: z.number(),
        lon: z.number(),
        presenceMode: z.enum(['OFF', 'METRO', 'VENUE']).optional(),
    });
    app.post('/livemap/location', { preHandler: [authGuard] }, async (req, reply) => {
        try {
            const { lat, lon, presenceMode } = UpdateLocationSchema.parse(req.body);
            // In a real app, you'd store location in a separate table with timestamps
            // For now, just update presence mode if provided
            if (presenceMode) {
                await prisma.user.update({
                    where: { id: req.user.sub },
                    data: { presenceMode },
                });
            }
            // TODO: Store location data in a separate location tracking table
            // This would include lat, lon, timestamp, accuracy, etc.
            return { success: true };
        }
        catch (error) {
            console.error('Error updating location:', error);
            return reply.status(500).send({ error: 'Failed to update location' });
        }
    });
    // Get user presence status
    app.get('/livemap/presence/:userId', async (req, reply) => {
        const { userId } = req.params;
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    handle: true,
                    displayName: true,
                    presenceMode: true,
                },
            });
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }
            return {
                user,
                isOnline: user.presenceMode !== 'OFF',
                lastSeen: new Date(), // In a real app, track actual last seen
            };
        }
        catch (error) {
            console.error('Error fetching user presence:', error);
            return reply.status(500).send({ error: 'Failed to fetch presence' });
        }
    });
    // Get live race data
    app.get('/livemap/races/live', async () => {
        try {
            const liveRaces = await prisma.race.findMany({
                where: {
                    status: 'active',
                    startTime: { lte: new Date() },
                    endTime: { gte: new Date() },
                },
                include: {
                    participants: {
                        include: {
                            racer: {
                                select: {
                                    id: true,
                                    handle: true,
                                    displayName: true,
                                },
                            },
                            car: {
                                select: {
                                    id: true,
                                    name: true,
                                    make: true,
                                    model: true,
                                },
                            },
                        },
                    },
                    results: {
                        include: {
                            racer: {
                                select: {
                                    id: true,
                                    handle: true,
                                },
                            },
                        },
                        orderBy: {
                            position: 'asc',
                        },
                    },
                },
            });
            return liveRaces.map(race => ({
                id: race.id,
                name: race.name,
                raceType: race.raceType,
                status: race.status,
                startTime: race.startTime,
                location: {
                    name: race.locationName,
                    lat: race.locationLat,
                    lon: race.locationLon,
                },
                participants: race.participants.map(p => ({
                    id: p.id,
                    racer: p.racer,
                    car: p.car,
                    position: p.position,
                })),
                results: race.results.map(r => ({
                    id: r.id,
                    racer: r.racer,
                    position: r.position,
                    timeSeconds: r.timeSeconds,
                    topSpeed: r.topSpeed,
                })),
            }));
        }
        catch (error) {
            console.error('Error fetching live races:', error);
            return [];
        }
    });
    // Join live race tracking
    app.post('/livemap/races/:raceId/track', { preHandler: [authGuard] }, async (req, reply) => {
        try {
            const { raceId } = req.params;
            // Check if user is participating in this race
            const participant = await prisma.raceParticipant.findUnique({
                where: {
                    raceId_racerId: {
                        raceId,
                        racerId: req.user.sub,
                    },
                },
            });
            if (!participant) {
                return reply.status(403).send({ error: 'Not participating in this race' });
            }
            // TODO: Initialize real-time tracking session
            // This would involve WebSocket connections, GPS tracking, etc.
            return { success: true, message: 'Tracking started' };
        }
        catch (error) {
            console.error('Error starting race tracking:', error);
            return reply.status(500).send({ error: 'Failed to start tracking' });
        }
    });
    // Submit race telemetry data
    const TelemetrySchema = z.object({
        lat: z.number(),
        lon: z.number(),
        speed: z.number().min(0),
        heading: z.number().min(0).max(360),
        altitude: z.number().optional(),
        accuracy: z.number().optional(),
        timestamp: z.string().transform(str => new Date(str)),
    });
    app.post('/livemap/races/:raceId/telemetry', { preHandler: [authGuard] }, async (req, reply) => {
        try {
            const { raceId } = req.params;
            const telemetryData = TelemetrySchema.parse(req.body);
            // Find active session for this race and user
            const session = await prisma.raceSession.findFirst({
                where: {
                    raceId,
                    userId: req.user.sub,
                    isCompleted: false,
                },
            });
            if (!session) {
                return reply.status(404).send({ error: 'No active session found' });
            }
            // Store GPS point
            await prisma.gPSPoint.create({
                data: {
                    sessionId: session.id,
                    latitude: telemetryData.lat,
                    longitude: telemetryData.lon,
                    speed: telemetryData.speed,
                    heading: telemetryData.heading,
                    altitude: telemetryData.altitude,
                    accuracy: telemetryData.accuracy,
                    timestamp: telemetryData.timestamp,
                    sequenceIndex: 0, // TODO: Calculate proper sequence
                },
            });
            return { success: true };
        }
        catch (error) {
            console.error('Error storing telemetry:', error);
            return reply.status(500).send({ error: 'Failed to store telemetry' });
        }
    });
}
//# sourceMappingURL=livemap.js.map