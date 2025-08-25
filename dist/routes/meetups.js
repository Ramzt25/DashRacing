import { prisma } from '../prisma.js';
import { authGuard } from '../auth.js';
import { z } from 'zod';
export async function registerMeetupRoutes(app) {
    // Get all public meetups
    app.get('/meetups', async (req) => {
        const { eventType, limit = 20 } = req.query;
        const where = {
            isPublic: true,
            status: 'upcoming',
            startTime: {
                gte: new Date(),
            },
        };
        if (eventType) {
            where.eventType = eventType;
        }
        const meetups = await prisma.event.findMany({
            where,
            include: {
                attendances: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                handle: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        car: {
                            select: {
                                id: true,
                                name: true,
                                make: true,
                                model: true,
                                year: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        attendances: true,
                    },
                },
            },
            orderBy: {
                startTime: 'asc',
            },
            take: Number(limit),
        });
        return meetups.map(meetup => ({
            id: meetup.id,
            title: meetup.title,
            description: meetup.description,
            eventType: meetup.eventType,
            startTime: meetup.startTime,
            endTime: meetup.endTime,
            location: {
                name: meetup.locationName,
                address: meetup.locationAddress,
                lat: meetup.locationLat,
                lon: meetup.locationLon,
            },
            maxAttendees: meetup.maxAttendees,
            entryFee: meetup.entryFee,
            imageUrl: meetup.imageUrl,
            status: meetup.status,
            participantCount: meetup._count.attendances,
            participants: meetup.attendances.map(attendance => ({
                id: attendance.id,
                user: attendance.user,
                car: attendance.car,
                status: attendance.status,
            })),
        }));
    });
    // Get meetup by ID
    app.get('/meetups/:id', async (req, reply) => {
        const { id } = req.params;
        const meetup = await prisma.event.findUnique({
            where: { id },
            include: {
                attendances: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                handle: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                        car: {
                            select: {
                                id: true,
                                name: true,
                                make: true,
                                model: true,
                                year: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        attendances: true,
                    },
                },
            },
        });
        if (!meetup) {
            return reply.status(404).send({ error: 'Meetup not found' });
        }
        return {
            id: meetup.id,
            title: meetup.title,
            description: meetup.description,
            eventType: meetup.eventType,
            startTime: meetup.startTime,
            endTime: meetup.endTime,
            location: {
                name: meetup.locationName,
                address: meetup.locationAddress,
                lat: meetup.locationLat,
                lon: meetup.locationLon,
            },
            maxAttendees: meetup.maxAttendees,
            entryFee: meetup.entryFee,
            requirements: meetup.requirements,
            tags: meetup.tags,
            imageUrl: meetup.imageUrl,
            isPublic: meetup.isPublic,
            status: meetup.status,
            participantCount: meetup._count.attendances,
            participants: meetup.attendances.map(attendance => ({
                id: attendance.id,
                user: attendance.user,
                car: attendance.car,
                status: attendance.status,
                notes: attendance.notes,
            })),
        };
    });
    // Create a new meetup
    const CreateMeetupSchema = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        eventType: z.enum(['meetup', 'race', 'show', 'cruise']),
        startTime: z.string().transform(str => new Date(str)),
        endTime: z.string().transform(str => new Date(str)).optional(),
        locationName: z.string().optional(),
        locationAddress: z.string().optional(),
        locationLat: z.number().optional(),
        locationLon: z.number().optional(),
        maxAttendees: z.number().positive().optional(),
        entryFee: z.number().min(0).optional(),
        requirements: z.any().optional(),
        tags: z.array(z.string()).default([]),
        imageUrl: z.string().url().optional(),
        isPublic: z.boolean().default(true),
    });
    app.post('/meetups', { preHandler: [authGuard] }, async (req, reply) => {
        try {
            const data = CreateMeetupSchema.parse(req.body);
            const meetup = await prisma.event.create({
                data: {
                    ...data,
                    status: 'upcoming',
                },
            });
            return { success: true, meetup };
        }
        catch (error) {
            console.error('Error creating meetup:', error);
            return reply.status(500).send({ error: 'Failed to create meetup' });
        }
    });
    // Join a meetup
    app.post('/meetups/:id/join', { preHandler: [authGuard] }, async (req, reply) => {
        try {
            const { id: eventId } = req.params;
            const { carId, notes } = req.body;
            // Check if meetup exists
            const meetup = await prisma.event.findUnique({
                where: { id: eventId },
                include: {
                    _count: {
                        select: {
                            attendances: true,
                        },
                    },
                },
            });
            if (!meetup) {
                return reply.status(404).send({ error: 'Meetup not found' });
            }
            if (meetup.status !== 'upcoming') {
                return reply.status(400).send({ error: 'Cannot join this meetup' });
            }
            if (meetup.maxAttendees && meetup._count.attendances >= meetup.maxAttendees) {
                return reply.status(400).send({ error: 'Meetup is full' });
            }
            // Check if already joined
            const existing = await prisma.attendance.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId: req.user.sub,
                    },
                },
            });
            if (existing) {
                return reply.status(400).send({ error: 'Already joined this meetup' });
            }
            // Join the meetup
            const attendance = await prisma.attendance.create({
                data: {
                    eventId,
                    userId: req.user.sub,
                    carId,
                    notes,
                    status: 'going',
                },
            });
            return { success: true, attendance };
        }
        catch (error) {
            console.error('Error joining meetup:', error);
            return reply.status(500).send({ error: 'Failed to join meetup' });
        }
    });
    // Leave a meetup
    app.delete('/meetups/:id/leave', { preHandler: [authGuard] }, async (req, reply) => {
        try {
            const { id: eventId } = req.params;
            const attendance = await prisma.attendance.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId: req.user.sub,
                    },
                },
            });
            if (!attendance) {
                return reply.status(404).send({ error: 'Not attending this meetup' });
            }
            await prisma.attendance.delete({
                where: {
                    eventId_userId: {
                        eventId,
                        userId: req.user.sub,
                    },
                },
            });
            return { success: true };
        }
        catch (error) {
            console.error('Error leaving meetup:', error);
            return reply.status(500).send({ error: 'Failed to leave meetup' });
        }
    });
    // Update attendance status
    app.patch('/meetups/:id/attendance', { preHandler: [authGuard] }, async (req, reply) => {
        try {
            const { id: eventId } = req.params;
            const { status, carId, notes } = req.body;
            const attendance = await prisma.attendance.findUnique({
                where: {
                    eventId_userId: {
                        eventId,
                        userId: req.user.sub,
                    },
                },
            });
            if (!attendance) {
                return reply.status(404).send({ error: 'Not attending this meetup' });
            }
            const updatedAttendance = await prisma.attendance.update({
                where: {
                    eventId_userId: {
                        eventId,
                        userId: req.user.sub,
                    },
                },
                data: {
                    ...(status && { status }),
                    ...(carId !== undefined && { carId }),
                    ...(notes !== undefined && { notes }),
                },
            });
            return { success: true, attendance: updatedAttendance };
        }
        catch (error) {
            console.error('Error updating attendance:', error);
            return reply.status(500).send({ error: 'Failed to update attendance' });
        }
    });
    // Get my meetups
    app.get('/my/meetups', { preHandler: [authGuard] }, async (req) => {
        const { status } = req.query;
        let timeFilter = {};
        if (status === 'upcoming') {
            timeFilter = { startTime: { gte: new Date() } };
        }
        else if (status === 'past') {
            timeFilter = { startTime: { lt: new Date() } };
        }
        const attendances = await prisma.attendance.findMany({
            where: {
                userId: req.user.sub,
                event: timeFilter,
            },
            include: {
                event: {
                    include: {
                        _count: {
                            select: {
                                attendances: true,
                            },
                        },
                    },
                },
                car: {
                    select: {
                        id: true,
                        name: true,
                        make: true,
                        model: true,
                        year: true,
                    },
                },
            },
            orderBy: {
                event: {
                    startTime: status === 'past' ? 'desc' : 'asc',
                },
            },
        });
        return attendances
            .filter(attendance => attendance.event) // Filter out null events from time filter
            .map(attendance => ({
            id: attendance.id,
            status: attendance.status,
            car: attendance.car,
            notes: attendance.notes,
            event: {
                id: attendance.event.id,
                title: attendance.event.title,
                description: attendance.event.description,
                eventType: attendance.event.eventType,
                startTime: attendance.event.startTime,
                endTime: attendance.event.endTime,
                location: {
                    name: attendance.event.locationName,
                    address: attendance.event.locationAddress,
                },
                participantCount: attendance.event._count.attendances,
            },
        }));
    });
}
//# sourceMappingURL=meetups.js.map