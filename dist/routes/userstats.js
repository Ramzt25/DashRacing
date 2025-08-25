import { prisma } from '../prisma.js';
import { authGuard } from '../auth.js';
export async function registerUserStatsRoutes(app) {
    // Get user race statistics
    app.get('/users/:userId/stats', async (req, reply) => {
        const { userId } = req.params;
        try {
            // Get user with race results
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    raceResults: {
                        include: {
                            race: {
                                select: {
                                    id: true,
                                    name: true,
                                    raceType: true,
                                    locationName: true,
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
                            createdAt: 'desc',
                        },
                    },
                    cars: {
                        include: {
                            modifications: true,
                        },
                    },
                },
            });
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }
            // Calculate basic stats
            const totalRaces = user.raceResults.length;
            const wins = user.raceResults.filter(result => result.position === 1).length;
            const podiums = user.raceResults.filter(result => result.position && result.position <= 3).length;
            const winRate = totalRaces > 0 ? (wins / totalRaces) * 100 : 0;
            // Get best lap times (if available)
            const bestLapTimes = user.raceResults
                .filter(result => result.timeSeconds)
                .map(result => result.timeSeconds)
                .sort((a, b) => a - b)
                .slice(0, 5);
            // Car statistics
            const carStats = user.cars.map(car => ({
                id: car.id,
                name: car.name,
                make: car.make,
                model: car.model,
                year: car.year,
                modCount: car.modifications.length,
                raceCount: user.raceResults.filter(result => result.carId === car.id).length,
            }));
            // Recent race history
            const recentRaces = user.raceResults.slice(0, 10).map(result => ({
                id: result.id,
                raceId: result.raceId,
                raceName: result.race?.name || 'Unknown Race',
                raceType: result.race?.raceType || 'unknown',
                position: result.position,
                timeSeconds: result.timeSeconds,
                topSpeed: result.topSpeed,
                performanceScore: result.performanceScore,
                date: result.createdAt,
                car: result.car,
            }));
            return {
                user: {
                    id: user.id,
                    handle: user.handle,
                    displayName: user.displayName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                stats: {
                    totalRaces,
                    wins,
                    podiums,
                    winRate: Math.round(winRate * 100) / 100,
                    bestLapTimes,
                },
                cars: carStats,
                recentRaces,
            };
        }
        catch (error) {
            console.error('Error fetching user stats:', error);
            return reply.status(500).send({ error: 'Failed to fetch user stats' });
        }
    });
    // Get my own stats (authenticated route)
    app.get('/my/stats', { preHandler: [authGuard] }, async (req, reply) => {
        try {
            return app.inject({
                method: 'GET',
                url: `/users/${req.user.sub}/stats`,
            }).then(response => response.json());
        }
        catch (error) {
            console.error('Error fetching my stats:', error);
            return reply.status(500).send({ error: 'Failed to fetch stats' });
        }
    });
    // Get leaderboard
    app.get('/leaderboard', async (req, reply) => {
        try {
            const { limit = 10, raceType } = req.query;
            // Build where clause for race type filter
            const raceWhere = raceType ? { raceType } : {};
            // Get top performers by win count
            const topWinners = await prisma.user.findMany({
                include: {
                    raceResults: {
                        where: {
                            position: 1,
                            race: raceWhere,
                        },
                        include: {
                            race: {
                                select: {
                                    raceType: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            raceResults: true,
                        },
                    },
                },
                orderBy: {
                    raceResults: {
                        _count: 'desc',
                    },
                },
                take: Number(limit),
            });
            const leaderboard = topWinners.map((user, index) => ({
                rank: index + 1,
                user: {
                    id: user.id,
                    handle: user.handle,
                    displayName: user.displayName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                },
                wins: user.raceResults.length,
                totalRaces: user._count.raceResults,
                winRate: user._count.raceResults > 0
                    ? Math.round((user.raceResults.length / user._count.raceResults) * 100 * 100) / 100
                    : 0,
            }));
            return {
                leaderboard,
                filters: {
                    raceType: raceType || 'all',
                    limit: Number(limit),
                },
            };
        }
        catch (error) {
            console.error('Error fetching leaderboard:', error);
            return reply.status(500).send({ error: 'Failed to fetch leaderboard' });
        }
    });
    // Get car performance stats
    app.get('/cars/:carId/stats', async (req, reply) => {
        const { carId } = req.params;
        try {
            const car = await prisma.car.findUnique({
                where: { id: carId },
                include: {
                    raceResults: {
                        include: {
                            race: {
                                select: {
                                    id: true,
                                    name: true,
                                    raceType: true,
                                    locationName: true,
                                },
                            },
                        },
                        orderBy: {
                            createdAt: 'desc',
                        },
                    },
                    modifications: true,
                    user: {
                        select: {
                            id: true,
                            handle: true,
                            displayName: true,
                        },
                    },
                },
            });
            if (!car) {
                return reply.status(404).send({ error: 'Car not found' });
            }
            // Calculate car performance stats
            const totalRaces = car.raceResults.length;
            const wins = car.raceResults.filter(result => result.position === 1).length;
            const podiums = car.raceResults.filter(result => result.position && result.position <= 3).length;
            const averagePosition = totalRaces > 0
                ? car.raceResults
                    .filter(result => result.position)
                    .reduce((sum, result) => sum + (result.position || 0), 0) /
                    car.raceResults.filter(result => result.position).length
                : 0;
            const bestTimes = car.raceResults
                .filter(result => result.timeSeconds)
                .map(result => result.timeSeconds)
                .sort((a, b) => a - b)
                .slice(0, 5);
            const topSpeeds = car.raceResults
                .filter(result => result.topSpeed)
                .map(result => result.topSpeed)
                .sort((a, b) => b - a)
                .slice(0, 5);
            return {
                car: {
                    id: car.id,
                    name: car.name,
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    owner: car.user,
                },
                stats: {
                    totalRaces,
                    wins,
                    podiums,
                    winRate: totalRaces > 0 ? Math.round((wins / totalRaces) * 100 * 100) / 100 : 0,
                    averagePosition: Math.round(averagePosition * 100) / 100,
                    bestTimes,
                    topSpeeds,
                },
                modifications: car.modifications,
                recentRaces: car.raceResults.slice(0, 10).map(result => ({
                    id: result.id,
                    raceId: result.raceId,
                    raceName: result.race?.name || 'Unknown Race',
                    raceType: result.race?.raceType || 'unknown',
                    position: result.position,
                    timeSeconds: result.timeSeconds,
                    topSpeed: result.topSpeed,
                    performanceScore: result.performanceScore,
                    date: result.createdAt,
                })),
            };
        }
        catch (error) {
            console.error('Error fetching car stats:', error);
            return reply.status(500).send({ error: 'Failed to fetch car stats' });
        }
    });
}
//# sourceMappingURL=userstats.js.map