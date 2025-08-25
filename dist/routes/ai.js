import { prisma } from '../prisma.js';
// AI Service Implementation (Backend version)
class BackendAIService {
    static async analyzeCarPerformance(carId, modifications) {
        try {
            // Try external AI API first
            const response = await fetch(`${process.env.AI_API_URL}/analyze-performance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                },
                body: JSON.stringify({ carId, modifications }),
            });
            if (response.ok) {
                return await response.json();
            }
        }
        catch (error) {
            console.warn('AI API unavailable, using local analysis:', error);
        }
        // Fallback to local analysis
        const car = await prisma.car.findUnique({
            where: { id: carId },
            include: { modifications: true },
        });
        if (!car) {
            throw new Error('Car not found');
        }
        // Local AI analysis algorithm
        const basePower = car.basePower || this.estimateBasePower(car.make || '', car.model || '', car.year || 0);
        let currentPower = basePower;
        let reliability = 95;
        let handling = 75;
        let acceleration = 70;
        // Apply modifications
        for (const mod of car.modifications) {
            if (mod.powerGain) {
                currentPower += mod.powerGain;
            }
            if (mod.reliabilityImpact) {
                reliability += mod.reliabilityImpact;
            }
        }
        // Calculate performance score
        const performanceScore = Math.round((currentPower * 0.4) + (handling * 0.3) + (acceleration * 0.2) + (reliability * 0.1));
        return {
            carId,
            basePower,
            currentPower,
            performanceScore,
            reliability,
            handling,
            acceleration,
            recommendations: this.generateRecommendations(car, performanceScore),
            analysis: {
                powerToWeightRatio: currentPower / (car.weightKg || 3000),
                modificationEfficiency: ((currentPower - basePower) / basePower) * 100,
                reliabilityStatus: reliability > 80 ? 'excellent' : reliability > 60 ? 'good' : 'poor',
            },
        };
    }
    static async compareVehicles(carIds, comparisonType) {
        try {
            // Try external AI API first
            const response = await fetch(`${process.env.AI_API_URL}/compare-vehicles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                },
                body: JSON.stringify({ carIds, comparisonType }),
            });
            if (response.ok) {
                return await response.json();
            }
        }
        catch (error) {
            console.warn('AI API unavailable, using local comparison:', error);
        }
        // Fallback to local comparison
        const cars = await prisma.car.findMany({
            where: { id: { in: carIds } },
            include: { modifications: true },
        });
        const comparisons = await Promise.all(cars.map((car) => this.analyzeCarPerformance(car.id)));
        return {
            comparisonType,
            vehicles: comparisons.map((analysis, index) => ({
                car: cars[index],
                analysis,
                ranking: this.calculateRanking(analysis, comparisonType),
            })).sort((a, b) => b.ranking - a.ranking),
            winner: comparisons[0],
            insights: this.generateComparisonInsights(comparisons, comparisonType),
        };
    }
    static async getUpgradeRecommendations(carId, budget, goals = [], experience = 'intermediate') {
        try {
            // Try external AI API first
            const response = await fetch(`${process.env.AI_API_URL}/upgrade-recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                },
                body: JSON.stringify({ carId, budget, goals, experience }),
            });
            if (response.ok) {
                return await response.json();
            }
        }
        catch (error) {
            console.warn('AI API unavailable, using local recommendations:', error);
        }
        // Fallback to local recommendations
        const car = await prisma.car.findUnique({
            where: { id: carId },
            include: { modifications: true },
        });
        if (!car) {
            throw new Error('Car not found');
        }
        const currentAnalysis = await this.analyzeCarPerformance(carId);
        const recommendations = this.generateUpgradeRecommendations(car, budget, goals, experience);
        return {
            carId,
            currentPerformance: currentAnalysis,
            budget,
            goals,
            experience,
            recommendations: recommendations.slice(0, 10),
            priorityOrder: this.prioritizeUpgrades(recommendations, goals, experience),
            estimatedResults: this.estimateUpgradeResults(currentAnalysis, recommendations),
        };
    }
    static async predictRacePerformance(carId, trackType, conditions) {
        try {
            // Try external AI API first
            const response = await fetch(`${process.env.AI_API_URL}/predict-race-performance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.AI_API_KEY}`,
                },
                body: JSON.stringify({ carId, trackType, conditions }),
            });
            if (response.ok) {
                return await response.json();
            }
        }
        catch (error) {
            console.warn('AI API unavailable, using local prediction:', error);
        }
        // Fallback to local prediction
        const analysis = await this.analyzeCarPerformance(carId);
        // Adjust performance based on conditions
        let adjustedPerformance = analysis.performanceScore;
        if (conditions.weather === 'wet')
            adjustedPerformance *= 0.85;
        if (conditions.weather === 'mixed')
            adjustedPerformance *= 0.92;
        if (conditions.temperature > 90)
            adjustedPerformance *= 0.95;
        if (conditions.temperature < 40)
            adjustedPerformance *= 0.90;
        // Track type adjustments
        const trackMultipliers = {
            street: 0.9,
            track: 1.1,
            drag: trackType === 'drag' ? 1.2 : 0.8,
            circuit: 1.05,
        };
        adjustedPerformance *= trackMultipliers[trackType] || 1.0;
        return {
            carId,
            trackType,
            conditions,
            basePerformance: analysis.performanceScore,
            adjustedPerformance: Math.round(adjustedPerformance),
            predictions: {
                lapTime: this.estimateLapTime(adjustedPerformance, trackType),
                topSpeed: this.estimateTopSpeed(analysis.currentPower, analysis.acceleration),
                acceleration: this.estimateAcceleration(analysis.currentPower, trackType),
                handling: this.estimateHandling(analysis.handling, conditions),
            },
            confidence: 0.85,
            tips: this.generateRaceTips(analysis, trackType, conditions),
        };
    }
    // Helper methods
    static estimateBasePower(make, model, year) {
        // Database of common car power figures
        const powerDatabase = {
            'honda civic': 158,
            'toyota camry': 203,
            'ford mustang': 310,
            'chevrolet corvette': 495,
            'bmw m3': 473,
            'audi rs4': 444,
            'subaru wrx': 268,
            'nissan 370z': 332,
        };
        const key = `${make.toLowerCase()} ${model.toLowerCase()}`;
        return powerDatabase[key] || 200; // Default estimate
    }
    static generateRecommendations(car, performanceScore) {
        const recommendations = [];
        if (performanceScore < 300) {
            recommendations.push('Consider a cold air intake for immediate power gains');
            recommendations.push('Upgrade to a performance exhaust system');
        }
        if (performanceScore < 500) {
            recommendations.push('Tune the ECU for optimized performance');
            recommendations.push('Install a turbocharger or supercharger');
        }
        if (car.modifications.length < 3) {
            recommendations.push('Start with basic bolt-on modifications');
        }
        return recommendations;
    }
    static calculateRanking(analysis, comparisonType) {
        switch (comparisonType) {
            case 'performance':
                return analysis.performanceScore;
            case 'value':
                return analysis.performanceScore / (analysis.estimatedValue || 25000);
            case 'racing':
                return (analysis.currentPower * 0.6) + (analysis.handling * 0.4);
            case 'daily':
                return (analysis.reliability * 0.5) + (analysis.performanceScore * 0.3) + (100 * 0.2); // fuel economy placeholder
            default:
                return analysis.performanceScore;
        }
    }
    static generateComparisonInsights(comparisons, comparisonType) {
        const insights = [];
        const sorted = comparisons.sort((a, b) => b.performanceScore - a.performanceScore);
        insights.push(`Best overall performance: ${sorted[0].carId}`);
        insights.push(`Most modified: ${comparisons.find(c => c.modifications?.length > 0)?.carId || 'None'}`);
        return insights;
    }
    static generateUpgradeRecommendations(car, budget, goals = [], experience = 'intermediate') {
        const recommendations = [];
        // Basic recommendations based on experience
        if (experience === 'beginner') {
            recommendations.push({
                type: 'intake',
                name: 'Cold Air Intake',
                cost: 300,
                powerGain: 15,
                difficulty: 'easy',
                priority: 'high',
            });
        }
        if (goals.includes('power')) {
            recommendations.push({
                type: 'turbo',
                name: 'Turbocharger Kit',
                cost: 3500,
                powerGain: 100,
                difficulty: 'hard',
                priority: 'high',
            });
        }
        return recommendations.filter(rec => !budget || rec.cost <= budget);
    }
    static prioritizeUpgrades(recommendations, goals, experience) {
        return recommendations.sort((a, b) => {
            let scoreA = 0, scoreB = 0;
            // Priority scoring
            if (a.priority === 'high')
                scoreA += 3;
            if (b.priority === 'high')
                scoreB += 3;
            // Experience level
            if (experience === 'beginner' && a.difficulty === 'easy')
                scoreA += 2;
            if (experience === 'beginner' && b.difficulty === 'easy')
                scoreB += 2;
            return scoreB - scoreA;
        });
    }
    static estimateUpgradeResults(currentAnalysis, recommendations) {
        let totalPowerGain = 0;
        let totalCost = 0;
        for (const rec of recommendations.slice(0, 5)) {
            totalPowerGain += rec.powerGain || 0;
            totalCost += rec.cost || 0;
        }
        return {
            estimatedPowerIncrease: totalPowerGain,
            estimatedCost: totalCost,
            newPerformanceScore: currentAnalysis.performanceScore + (totalPowerGain * 2),
            paybackMonths: Math.round(totalCost / 100), // Simplified calculation
        };
    }
    static estimateLapTime(performance, trackType) {
        // Simplified lap time estimation
        const baseTime = trackType === 'drag' ? 13.5 : 90; // seconds
        const adjustment = (600 - performance) / 50;
        const finalTime = baseTime + adjustment;
        return trackType === 'drag'
            ? `${finalTime.toFixed(2)}s (quarter mile)`
            : `${Math.floor(finalTime / 60)}:${(finalTime % 60).toFixed(2)} (lap)`;
    }
    static estimateTopSpeed(power, acceleration) {
        return Math.round(80 + (power / 10) + (acceleration / 5));
    }
    static estimateAcceleration(power, trackType) {
        const baseTime = 6.5 - (power / 100);
        return `${Math.max(baseTime, 2.8).toFixed(1)}s (0-60 mph)`;
    }
    static estimateHandling(handling, conditions) {
        let adjusted = handling;
        if (conditions.weather === 'wet')
            adjusted *= 0.8;
        if (conditions.surface === 'concrete')
            adjusted *= 1.05;
        return Math.round(adjusted);
    }
    static generateRaceTips(analysis, trackType, conditions) {
        const tips = [];
        if (conditions.weather === 'wet') {
            tips.push('Reduce tire pressure by 2-3 PSI for better wet traction');
            tips.push('Be gentle with throttle input to avoid wheelspin');
        }
        if (trackType === 'drag') {
            tips.push('Launch at 3000 RPM for optimal acceleration');
            tips.push('Shift at redline for maximum speed');
        }
        if (analysis.reliability < 80) {
            tips.push('Consider reliability upgrades before racing');
        }
        return tips;
    }
}
export async function registerAIRoutes(fastify) {
    // Analyze car performance
    fastify.post('/ai/analyze-performance', {
        schema: {
            body: {
                type: 'object',
                required: ['carId'],
                properties: {
                    carId: { type: 'string' },
                    modifications: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: { type: 'string' },
                                value: { type: 'string' },
                                powerGain: { type: 'number' }
                            }
                        }
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { carId, modifications } = request.body;
            const result = await BackendAIService.analyzeCarPerformance(carId, modifications);
            // Update car with AI analysis
            await prisma.car.update({
                where: { id: carId },
                data: {
                    currentPower: result.currentPower,
                    performanceScore: result.performanceScore,
                    aiAnalysisDate: new Date(),
                },
            });
            return result;
        }
        catch (error) {
            reply.status(400).send({ error: error?.message || 'Analysis failed' });
        }
    });
    // Compare vehicles
    fastify.post('/ai/compare-vehicles', {
        schema: {
            body: {
                type: 'object',
                required: ['carIds', 'comparisonType'],
                properties: {
                    carIds: {
                        type: 'array',
                        items: { type: 'string' },
                        minItems: 2,
                        maxItems: 5
                    },
                    comparisonType: {
                        type: 'string',
                        enum: ['performance', 'value', 'racing', 'daily']
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { carIds, comparisonType } = request.body;
            const result = await BackendAIService.compareVehicles(carIds, comparisonType);
            return result;
        }
        catch (error) {
            reply.status(400).send({ error: error?.message || 'Comparison failed' });
        }
    });
    // Get upgrade recommendations
    fastify.post('/ai/upgrade-recommendations', {
        schema: {
            body: {
                type: 'object',
                required: ['carId', 'goals', 'experience'],
                properties: {
                    carId: { type: 'string' },
                    budget: { type: 'number' },
                    goals: {
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['power', 'handling', 'acceleration', 'top-speed', 'reliability']
                        }
                    },
                    experience: {
                        type: 'string',
                        enum: ['beginner', 'intermediate', 'advanced']
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { carId, budget, goals, experience } = request.body;
            const result = await BackendAIService.getUpgradeRecommendations(carId, budget, goals, experience);
            return result;
        }
        catch (error) {
            reply.status(400).send({ error: error?.message || 'Recommendations failed' });
        }
    });
    // Predict race performance
    fastify.post('/ai/predict-race-performance', {
        schema: {
            body: {
                type: 'object',
                required: ['carId', 'trackType', 'conditions'],
                properties: {
                    carId: { type: 'string' },
                    trackType: {
                        type: 'string',
                        enum: ['street', 'track', 'drag', 'circuit']
                    },
                    conditions: {
                        type: 'object',
                        required: ['weather', 'temperature', 'surface'],
                        properties: {
                            weather: {
                                type: 'string',
                                enum: ['dry', 'wet', 'mixed']
                            },
                            temperature: { type: 'number' },
                            surface: {
                                type: 'string',
                                enum: ['asphalt', 'concrete', 'mixed']
                            }
                        }
                    }
                }
            }
        },
    }, async (request, reply) => {
        try {
            const { carId, trackType, conditions } = request.body;
            const result = await BackendAIService.predictRacePerformance(carId, trackType, conditions);
            return result;
        }
        catch (error) {
            reply.status(400).send({ error: error?.message || 'Prediction failed' });
        }
    });
    // Get AI insights for user dashboard
    fastify.get('/ai/user-insights/:userId', async (request, reply) => {
        try {
            const userId = request.params.userId;
            const userCars = await prisma.car.findMany({
                where: { userId },
                include: { modifications: true },
            });
            if (userCars.length === 0) {
                return {
                    insights: ['Add your first car to get AI-powered insights!'],
                    recommendations: [],
                    performance: null,
                };
            }
            // Get AI analysis for all user cars
            const analyses = await Promise.all(userCars.map((car) => BackendAIService.analyzeCarPerformance(car.id)));
            const bestCar = analyses.reduce((best, current) => current.performanceScore > best.performanceScore ? current : best);
            const insights = [
                `Your best performing car has a score of ${bestCar.performanceScore}`,
                `You have ${userCars.length} car${userCars.length > 1 ? 's' : ''} in your garage`,
                `Average performance across your fleet: ${Math.round(analyses.reduce((sum, a) => sum + a.performanceScore, 0) / analyses.length)}`,
            ];
            const recommendations = await BackendAIService.getUpgradeRecommendations(bestCar.carId, 1000, ['power'], 'intermediate');
            return {
                insights,
                recommendations: recommendations.recommendations.slice(0, 3),
                performance: {
                    bestCar: bestCar.carId,
                    averageScore: Math.round(analyses.reduce((sum, a) => sum + a.performanceScore, 0) / analyses.length),
                    totalCars: userCars.length,
                },
            };
        }
        catch (error) {
            reply.status(400).send({ error: error?.message || 'Insights failed' });
        }
    });
}
//# sourceMappingURL=ai.js.map