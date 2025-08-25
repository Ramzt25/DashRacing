// Week 7 - AI Racing Coach Service
// Performance analytics, personalized coaching, and skill development

interface RacingSession {
  sessionId: string;
  userId: string;
  vehicleId: string;
  trackId?: string;
  raceType: 'circuit' | 'drag' | 'drift' | 'street' | 'time_trial';
  startTime: Date;
  endTime: Date;
  
  // Performance data
  telemetry: Array<{
    timestamp: number;
    position: { lat: number; lng: number };
    speed: number; // mph
    acceleration: number; // g-force
    heading: number; // degrees
    elevation: number; // meters
    gearPosition?: number;
    rpm?: number;
    throttlePosition?: number; // 0-100%
    brakePosition?: number; // 0-100%
    steeringAngle?: number; // degrees
  }>;
  
  // Lap data (for circuit racing)
  laps?: Array<{
    lapNumber: number;
    lapTime: number; // seconds
    sectorTimes: number[]; // sector split times
    topSpeed: number;
    averageSpeed: number;
    isPersonalBest: boolean;
  }>;
  
  // Results
  finalPosition?: number;
  totalTime: number;
  bestLapTime?: number;
  topSpeed: number;
  averageSpeed: number;
  penaltyTime?: number;
}

interface PerformanceAnalytics {
  userId: string;
  timeframe: 'week' | 'month' | 'season' | 'all_time';
  
  // Overall stats
  overallStats: {
    totalRaces: number;
    totalWins: number;
    totalPodiums: number;
    winRate: number; // percentage
    averageFinishPosition: number;
    skillRating: number; // 1-10 scale
    improvementRate: number; // percentage change over time
  };
  
  // Category-specific performance
  categoryStats: {
    circuit: RacingCategoryStats;
    drag: RacingCategoryStats;
    drift: RacingCategoryStats;
    street: RacingCategoryStats;
  };
  
  // Driving style analysis
  drivingStyle: {
    aggressiveness: number; // 1-10 scale
    consistency: number; // 1-10 scale
    technicalSkill: number; // 1-10 scale
    riskTaking: number; // 1-10 scale
    adaptability: number; // 1-10 scale
    
    // Behavioral patterns
    brakingStyle: 'early' | 'late' | 'trail' | 'adaptive';
    corneringStyle: 'smooth' | 'aggressive' | 'technical' | 'adaptive';
    accelerationStyle: 'gradual' | 'aggressive' | 'modulated' | 'adaptive';
  };
  
  // Improvement areas
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
}

interface RacingCategoryStats {
  totalRaces: number;
  wins: number;
  podiums: number;
  winRate: number;
  bestTime?: number;
  averageLapTime?: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'professional';
  
  // Specific metrics per category
  circuitMetrics?: {
    averageLapTime: number;
    bestLapTime: number;
    consistencyRating: number;
    overtakeSuccess: number;
  };
  
  dragMetrics?: {
    bestQuarterMile: number;
    averageReactionTime: number;
    launchConsistency: number;
    topSpeed: number;
  };
  
  driftMetrics?: {
    averageScore: number;
    bestScore: number;
    angleConsistency: number;
    speedConsistency: number;
  };
  
  streetMetrics?: {
    trafficAvoidance: number;
    routeEfficiency: number;
    safetyRating: number;
    adaptabilityScore: number;
  };
}

interface CoachingRecommendation {
  id: string;
  type: 'technique' | 'setup' | 'practice' | 'mental' | 'equipment';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'braking' | 'cornering' | 'acceleration' | 'consistency' | 'racecraft' | 'vehicle_setup';
  
  title: string;
  description: string;
  detailedAdvice: string;
  
  // Practice exercises
  practiceExercises?: Array<{
    name: string;
    description: string;
    duration: number; // minutes
    difficulty: 'easy' | 'medium' | 'hard';
    expectedImprovement: string;
  }>;
  
  // Video tutorials
  tutorials?: Array<{
    title: string;
    url: string;
    duration: number; // seconds
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  
  // Measurable goals
  goals?: Array<{
    metric: string;
    currentValue: number;
    targetValue: number;
    timeframe: string;
    measurementMethod: string;
  }>;
  
  estimatedImprovementTime: string; // e.g., "2-3 weeks"
  confidence: number; // 0-1 (how confident the AI is in this recommendation)
}

class AIRacingCoachService {
  private static apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';
  private static analysisCache: Map<string, PerformanceAnalytics> = new Map();

  // Analyze racing session and provide immediate feedback
  static async analyzeRacingSession(session: RacingSession): Promise<CoachingRecommendation[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-coach/analyze-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth header
        },
        body: JSON.stringify(session),
      });

      if (!response.ok) return this.getMockSessionAnalysis();
      return await response.json() as CoachingRecommendation[];
    } catch (error) {
      console.error('Failed to analyze racing session:', error);
      return this.getMockSessionAnalysis();
    }
  }

  // Get comprehensive performance analytics
  static async getPerformanceAnalytics(userId: string, timeframe: string = 'month'): Promise<PerformanceAnalytics | null> {
    const cacheKey = `${userId}-${timeframe}`;
    
    // Check cache first
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-coach/analytics/${userId}?timeframe=${timeframe}`);
      if (!response.ok) return null;
      
      const analytics = await response.json() as PerformanceAnalytics;
      this.analysisCache.set(cacheKey, analytics);
      return analytics;
    } catch (error) {
      console.error('Failed to get performance analytics:', error);
      return this.getMockPerformanceAnalytics();
    }
  }

  // Get personalized coaching recommendations
  static async getPersonalizedCoaching(userId: string): Promise<CoachingRecommendation[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-coach/recommendations/${userId}`);
      if (!response.ok) return [];
      
      return await response.json() as CoachingRecommendation[];
    } catch (error) {
      console.error('Failed to get coaching recommendations:', error);
      return this.getMockCoachingRecommendations();
    }
  }

  // Analyze lap data for circuit racing
  static async analyzeLapData(lapData: RacingSession['laps']): Promise<{
    idealLapTime: number;
    improvementAreas: string[];
    sectorAnalysis: Array<{
      sector: number;
      currentTime: number;
      idealTime: number;
      improvement: number;
      advice: string;
    }>;
  }> {
    if (!lapData || lapData.length === 0) {
      return {
        idealLapTime: 0,
        improvementAreas: [],
        sectorAnalysis: [],
      };
    }

    // Find best sector times across all laps
    const bestSectorTimes = lapData.reduce((best, lap) => {
      lap.sectorTimes.forEach((time, index) => {
        if (!best[index] || time < best[index]) {
          best[index] = time;
        }
      });
      return best;
    }, [] as number[]);

    const idealLapTime = bestSectorTimes.reduce((sum, time) => sum + time, 0);
    const currentBest = Math.min(...lapData.map(lap => lap.lapTime));

    // Analyze each sector
    const sectorAnalysis = bestSectorTimes.map((bestTime, index) => {
      const averageTime = lapData.reduce((sum, lap) => sum + lap.sectorTimes[index], 0) / lapData.length;
      const improvement = averageTime - bestTime;
      
      let advice = '';
      if (improvement > 0.5) {
        advice = index === 0 ? 'Focus on corner entry and braking points' :
                index === 1 ? 'Work on mid-corner speed and line selection' :
                'Improve corner exit and acceleration technique';
      } else {
        advice = 'Sector time is consistent - maintain current approach';
      }

      return {
        sector: index + 1,
        currentTime: averageTime,
        idealTime: bestTime,
        improvement,
        advice,
      };
    });

    return {
      idealLapTime,
      improvementAreas: sectorAnalysis
        .filter(sector => sector.improvement > 0.3)
        .map(sector => `Sector ${sector.sector}: ${sector.advice}`),
      sectorAnalysis,
    };
  }

  // Provide real-time coaching during race
  static async getRealTimeCoaching(telemetryData: RacingSession['telemetry'][0], raceContext: {
    raceType: string;
    currentLap?: number;
    position?: number;
    timeToLeader?: number;
  }): Promise<string | null> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-coach/real-time`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ telemetryData, raceContext }),
      });

      if (!response.ok) return null;
      const result = await response.json() as { coaching: string };
      return result.coaching;
    } catch (error) {
      console.error('Failed to get real-time coaching:', error);
      
      // Provide basic coaching based on telemetry
      if (telemetryData.speed > 100 && telemetryData.brakePosition && telemetryData.brakePosition > 80) {
        return "Heavy braking at high speed - try braking earlier and more gradually";
      } else if (telemetryData.acceleration > 0.8 && telemetryData.throttlePosition && telemetryData.throttlePosition < 50) {
        return "You can apply more throttle in this corner - increase acceleration";
      } else if (telemetryData.steeringAngle && Math.abs(telemetryData.steeringAngle) > 30 && telemetryData.speed > 60) {
        return "Sharp steering at high speed - consider taking a wider line";
      }
      
      return null;
    }
  }

  // Track skill progression over time
  static async getSkillProgression(userId: string): Promise<{
    skillHistory: Array<{
      date: Date;
      overallSkill: number;
      categorySkills: {
        circuit: number;
        drag: number;
        drift: number;
        street: number;
      };
    }>;
    projectedImprovement: {
      timeframe: string;
      expectedSkillGain: number;
      confidenceLevel: number;
    };
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-coach/skill-progression/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      
      return await response.json() as {
        skillHistory: Array<{
          date: Date;
          overallSkill: number;
          categorySkills: {
            circuit: number;
            drag: number;
            drift: number;
            street: number;
          };
        }>;
        projectedImprovement: {
          timeframe: string;
          expectedSkillGain: number;
          confidenceLevel: number;
        };
      };
    } catch (error) {
      console.error('Failed to get skill progression:', error);
      return this.getMockSkillProgression();
    }
  }

  // Get competitor analysis (learn from faster drivers)
  static async getCompetitorAnalysis(userId: string, competitorId: string): Promise<{
    comparisonMetrics: {
      lapTimeDifference: number;
      brakingPointDifference: number;
      cornerSpeedDifference: number;
      accelerationDifference: number;
    };
    learningOpportunities: string[];
    specificAdvice: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/ai-coach/competitor-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, competitorId }),
      });

      if (!response.ok) throw new Error('Failed to fetch');
      return await response.json() as {
        comparisonMetrics: {
          lapTimeDifference: number;
          brakingPointDifference: number;
          cornerSpeedDifference: number;
          accelerationDifference: number;
        };
        learningOpportunities: string[];
        specificAdvice: string[];
      };
    } catch (error) {
      console.error('Failed to get competitor analysis:', error);
      return {
        comparisonMetrics: {
          lapTimeDifference: 0,
          brakingPointDifference: 0,
          cornerSpeedDifference: 0,
          accelerationDifference: 0,
        },
        learningOpportunities: [],
        specificAdvice: [],
      };
    }
  }

  // Mock data for development
  private static getMockSessionAnalysis(): CoachingRecommendation[] {
    return [
      {
        id: 'brake_001',
        type: 'technique',
        priority: 'high',
        category: 'braking',
        title: 'Optimize Braking Technique',
        description: 'Your braking is happening too late and too aggressively',
        detailedAdvice: 'Try braking 15-20 meters earlier and release pressure gradually as you approach the corner. This will help maintain vehicle balance and allow for better corner entry speed.',
        practiceExercises: [
          {
            name: 'Progressive Braking Drill',
            description: 'Practice braking with 70% force initially, then reduce to 30% as you approach the corner',
            duration: 15,
            difficulty: 'medium',
            expectedImprovement: '0.5-1.0 second lap time improvement',
          },
        ],
        estimatedImprovementTime: '1-2 weeks',
        confidence: 0.85,
      },
      {
        id: 'line_001',
        type: 'technique',
        priority: 'medium',
        category: 'cornering',
        title: 'Racing Line Optimization',
        description: 'You can gain time by taking a wider entry line in corners 3 and 7',
        detailedAdvice: 'Use more of the track width on corner entry to maintain higher speeds through the middle and exit phases.',
        estimatedImprovementTime: '3-4 practice sessions',
        confidence: 0.72,
      },
    ];
  }

  private static getMockPerformanceAnalytics(): PerformanceAnalytics {
    return {
      userId: 'mock_user',
      timeframe: 'month',
      overallStats: {
        totalRaces: 24,
        totalWins: 6,
        totalPodiums: 12,
        winRate: 25,
        averageFinishPosition: 3.2,
        skillRating: 7.4,
        improvementRate: 12.5,
      },
      categoryStats: {
        circuit: {
          totalRaces: 15,
          wins: 4,
          podiums: 8,
          winRate: 26.7,
          bestTime: 84.532,
          averageLapTime: 86.742,
          skillLevel: 'advanced',
        },
        drag: {
          totalRaces: 6,
          wins: 2,
          podiums: 3,
          winRate: 33.3,
          skillLevel: 'intermediate',
        },
        drift: {
          totalRaces: 2,
          wins: 0,
          podiums: 1,
          winRate: 0,
          skillLevel: 'beginner',
        },
        street: {
          totalRaces: 1,
          wins: 0,
          podiums: 0,
          winRate: 0,
          skillLevel: 'beginner',
        },
      },
      drivingStyle: {
        aggressiveness: 6.8,
        consistency: 7.2,
        technicalSkill: 7.8,
        riskTaking: 5.4,
        adaptability: 6.9,
        brakingStyle: 'late',
        corneringStyle: 'technical',
        accelerationStyle: 'aggressive',
      },
      strengths: ['Technical cornering', 'Late braking', 'Racecraft'],
      weaknesses: ['Consistency in wet conditions', 'Drift technique', 'Street racing adaptability'],
      improvementSuggestions: [
        'Practice more drift events to improve car control',
        'Work on smooth inputs for better consistency',
        'Study racing lines for unfamiliar tracks',
      ],
    };
  }

  private static getMockCoachingRecommendations(): CoachingRecommendation[] {
    return [
      {
        id: 'consistency_001',
        type: 'practice',
        priority: 'high',
        category: 'consistency',
        title: 'Improve Lap Time Consistency',
        description: 'Your lap times vary by 2-3 seconds. Focus on smooth, repeatable inputs.',
        detailedAdvice: 'Consistency comes from smooth steering, braking, and throttle inputs. Practice maintaining the same racing line lap after lap.',
        practiceExercises: [
          {
            name: 'Metronome Driving',
            description: 'Drive to a rhythm, focusing on hitting the same braking and turn-in points every lap',
            duration: 20,
            difficulty: 'medium',
            expectedImprovement: 'Reduce lap time variation by 50%',
          },
        ],
        estimatedImprovementTime: '2-3 weeks',
        confidence: 0.91,
      },
    ];
  }

  private static getMockSkillProgression() {
    return {
      skillHistory: [
        {
          date: new Date('2024-01-01'),
          overallSkill: 6.2,
          categorySkills: { circuit: 6.8, drag: 5.2, drift: 4.1, street: 5.8 },
        },
        {
          date: new Date('2024-02-01'),
          overallSkill: 6.8,
          categorySkills: { circuit: 7.2, drag: 5.8, drift: 4.3, street: 6.1 },
        },
        {
          date: new Date('2024-03-01'),
          overallSkill: 7.4,
          categorySkills: { circuit: 7.8, drag: 6.4, drift: 4.9, street: 6.5 },
        },
      ],
      projectedImprovement: {
        timeframe: '3 months',
        expectedSkillGain: 1.2,
        confidenceLevel: 0.78,
      },
    };
  }
}

export default AIRacingCoachService;
export type { RacingSession, PerformanceAnalytics, CoachingRecommendation, RacingCategoryStats };