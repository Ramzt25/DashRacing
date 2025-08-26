import { prisma } from '../prisma.js';

/**
 * Modification Learning Service - Self-improving modification database
 * 
 * Features:
 * - Learns from real dyno results vs AI predictions
 * - Updates modification predictions based on actual outcomes
 * - Tracks accuracy and builds confidence over time
 * - Provides increasingly accurate recommendations
 */
export class ModificationLearningService {
  
  /**
   * Record a real-world dyno result and learn from it
   */
  static async recordDynoResult(data: {
    carId: string;
    modificationId?: string;
    modDatabaseId?: string;
    baselinePower?: number;
    baselineTorque?: number;
    resultPower: number;
    resultTorque: number;
    modificationCost?: number;
    installationTime?: number;
    satisfactionRating?: number;
    notes?: string;
    dynoDetails?: any;
  }, userId?: string): Promise<any> {
    
    try {
      // Calculate actual gains
      const powerGain = data.baselinePower ? data.resultPower - data.baselinePower : data.resultPower;
      const torqueGain = data.baselineTorque ? data.resultTorque - data.baselineTorque : data.resultTorque;
      const percentGain = data.baselinePower ? (powerGain / data.baselinePower) * 100 : 0;
      
      // Create dyno result record
      const dynoResult = await prisma.dynoResult.create({
        data: {
          carId: data.carId,
          modificationId: data.modificationId,
          modDatabaseId: data.modDatabaseId,
          baselinePower: data.baselinePower,
          baselineTorque: data.baselineTorque,
          resultPower: data.resultPower,
          resultTorque: data.resultTorque,
          powerGain,
          torqueGain,
          percentGain,
          modificationCost: data.modificationCost,
          installationTime: data.installationTime,
          satisfactionRating: data.satisfactionRating,
          notes: data.notes,
          
          // Dyno details
          dynoType: data.dynoDetails?.dynoType,
          dynoShop: data.dynoDetails?.dynoShop,
          temperature: data.dynoDetails?.temperature,
          humidity: data.dynoDetails?.humidity,
          
          confidenceScore: 0.8, // High confidence for user-provided dyno results
          isVerified: false, // Needs verification
        }
      });
      
      console.log(`📊 Dyno result recorded: +${powerGain}HP, +${torqueGain}ft-lb`);
      
      // If linked to a modification database entry, trigger learning
      if (data.modDatabaseId) {
        await this.updateModificationLearning(data.modDatabaseId, dynoResult);
      }
      
      // If linked to a specific modification, try to find/create database entry
      if (data.modificationId && !data.modDatabaseId) {
        await this.linkModificationToDatabase(data.modificationId, dynoResult);
      }
      
      return dynoResult;
      
    } catch (error) {
      console.error('Failed to record dyno result:', error);
      throw error;
    }
  }
  
  /**
   * Update modification database based on real-world results
   */
  private static async updateModificationLearning(modDatabaseId: string, dynoResult: any) {
    try {
      // Get current modification data
      const modData = await prisma.modificationDatabase.findUnique({
        where: { id: modDatabaseId },
        include: { dynoResults: true }
      });
      
      if (!modData) {
        console.error('Modification database entry not found');
        return;
      }
      
      // Calculate new averages including this result
      const allResults = [...modData.dynoResults, dynoResult];
      const avgPowerGain = allResults.reduce((sum, r) => sum + r.powerGain, 0) / allResults.length;
      const avgTorqueGain = allResults.reduce((sum, r) => sum + r.torqueGain, 0) / allResults.length;
      const avgCost = allResults
        .filter(r => r.modificationCost)
        .reduce((sum, r) => sum + (r.modificationCost || 0), 0) / allResults.filter(r => r.modificationCost).length;
      
      // Calculate accuracy improvement
      const predictedPower = modData.predictedPowerGain || 0;
      const actualPower = avgPowerGain;
      const accuracy = predictedPower > 0 ? 1 - Math.abs(predictedPower - actualPower) / predictedPower : 0.5;
      
      // Update modification database entry
      const updatedMod = await prisma.modificationDatabase.update({
        where: { id: modDatabaseId },
        data: {
          actualPowerGain: avgPowerGain,
          actualTorqueGain: avgTorqueGain,
          actualCost: avgCost || modData.actualCost,
          totalInstalls: { increment: 1 },
          dynoResultCount: { increment: 1 },
          accuracy: Math.max(accuracy, modData.accuracy || 0),
          confidenceLevel: Math.min((modData.confidenceLevel || 0.5) + 0.1, 1.0), // Increase confidence
          popularityScore: { increment: 0.2 },
          lastLearningUpdate: new Date()
        }
      });
      
      console.log(`🎯 Learning Update: ${modData.name}`);
      console.log(`   Predicted: +${predictedPower}HP → Actual: +${actualPower.toFixed(1)}HP`);
      console.log(`   Accuracy: ${(accuracy * 100).toFixed(1)}% | Confidence: ${(updatedMod.confidenceLevel * 100).toFixed(1)}%`);
      
      // Mark dyno result as used for learning
      await prisma.dynoResult.update({
        where: { id: dynoResult.id },
        data: { usedForLearning: true }
      });
      
      // If this is a significant accuracy improvement, propagate to similar modifications
      if (accuracy > 0.8 && allResults.length >= 3) {
        await this.propagateLearning(modData, avgPowerGain, avgTorqueGain);
      }
      
    } catch (error) {
      console.error('Failed to update modification learning:', error);
    }
  }
  
  /**
   * Link a modification to the database and start learning
   */
  private static async linkModificationToDatabase(modificationId: string, dynoResult: any) {
    try {
      // Get modification details
      const modification = await prisma.modification.findUnique({
        where: { id: modificationId },
        include: { car: true }
      });
      
      if (!modification) return;
      
      // Try to find existing database entry
      let modDatabase = await prisma.modificationDatabase.findFirst({
        where: {
          name: { contains: modification.name },
          category: modification.category,
          brand: modification.brand || undefined
        }
      });
      
      // Create new database entry if none exists
      if (!modDatabase) {
        modDatabase = await this.createModificationDatabaseEntry(modification, dynoResult);
      }
      
      // Update the modification to link to database
      await prisma.modification.update({
        where: { id: modificationId },
        data: {
          modDatabaseId: modDatabase.id,
          predictedGains: {
            powerGain: modification.powerGain,
            torqueGain: modification.torqueGain,
            originalPrediction: new Date()
          }
        }
      });
      
      // Update dyno result to link to database
      await prisma.dynoResult.update({
        where: { id: dynoResult.id },
        data: { modDatabaseId: modDatabase.id }
      });
      
      console.log(`🔗 Linked modification "${modification.name}" to database learning system`);
      
    } catch (error) {
      console.error('Failed to link modification to database:', error);
    }
  }
  
  /**
   * Create new modification database entry from first real result
   */
  private static async createModificationDatabaseEntry(modification: any, dynoResult: any) {
    const car = modification.car;
    
    const modDatabase = await prisma.modificationDatabase.create({
      data: {
        name: modification.name,
        category: modification.category,
        brand: modification.brand,
        
        // Use the modification's predicted values as starting point
        predictedPowerGain: modification.powerGain,
        predictedTorqueGain: modification.torqueGain,
        
        // Real results become initial actual values
        actualPowerGain: dynoResult.powerGain,
        actualTorqueGain: dynoResult.torqueGain,
        actualCost: dynoResult.modificationCost,
        
        // Vehicle compatibility
        compatibleWith: [{
          year: car.year,
          make: car.make,
          model: car.model,
          trim: car.trim
        }],
        
        // Learning statistics
        totalInstalls: 1,
        dynoResultCount: 1,
        confidenceLevel: 0.6, // Medium confidence with first result
        
        // Calculate initial accuracy
        accuracy: modification.powerGain ? 
          1 - Math.abs(modification.powerGain - dynoResult.powerGain) / modification.powerGain : 0.5,
        
        avgInstallTime: dynoResult.installationTime,
        
        dataSource: 'User-Generated',
        lastLearningUpdate: new Date()
      }
    });
    
    console.log(`🆕 Created new modification database entry: ${modification.name}`);
    
    return modDatabase;
  }
  
  /**
   * Propagate learning to similar modifications
   */
  private static async propagateLearning(modData: any, avgPowerGain: number, avgTorqueGain: number) {
    try {
      // Find similar modifications (same category, similar name)
      const similarMods = await prisma.modificationDatabase.findMany({
        where: {
          category: modData.category,
          brand: modData.brand,
          name: { contains: modData.name.split(' ')[0] }, // First word match
          id: { not: modData.id }, // Exclude current mod
          confidenceLevel: { lt: 0.8 } // Only update less confident entries
        }
      });
      
      for (const similarMod of similarMods) {
        const weightedPowerGain = (similarMod.actualPowerGain || similarMod.predictedPowerGain || 0) * 0.7 + avgPowerGain * 0.3;
        const weightedTorqueGain = (similarMod.actualTorqueGain || similarMod.predictedTorqueGain || 0) * 0.7 + avgTorqueGain * 0.3;
        
        await prisma.modificationDatabase.update({
          where: { id: similarMod.id },
          data: {
            actualPowerGain: weightedPowerGain,
            actualTorqueGain: weightedTorqueGain,
            confidenceLevel: Math.min((similarMod.confidenceLevel || 0.5) + 0.05, 0.8), // Small confidence boost
            lastLearningUpdate: new Date()
          }
        });
      }
      
      console.log(`🔄 Propagated learning to ${similarMods.length} similar modifications`);
      
    } catch (error) {
      console.error('Failed to propagate learning:', error);
    }
  }
  
  /**
   * Get smart modification recommendations based on learned data
   */
  static async getSmartRecommendations(vehicleInfo: {
    year: number;
    make: string;
    model: string;
    trim?: string;
  }, goals: string[] = [], budget?: number): Promise<any[]> {
    
    try {
      // Find modifications compatible with this vehicle
      let recommendations = await prisma.modificationDatabase.findMany({
        where: {
          // For SQLite, we'll do a simpler compatibility check
          actualCost: budget ? { lte: budget } : undefined,
          confidenceLevel: { gte: 0.5 } // Only show confident recommendations
        },
        orderBy: [
          { accuracy: 'desc' },
          { popularityScore: 'desc' },
          { confidenceLevel: 'desc' }
        ],
        take: 10
      });
      
      // If no exact matches, broaden search
      if (recommendations.length === 0) {
        recommendations = await prisma.modificationDatabase.findMany({
          where: {
            actualCost: budget ? { lte: budget } : undefined,
            confidenceLevel: { gte: 0.3 }
          },
          orderBy: [
            { popularityScore: 'desc' },
            { confidenceLevel: 'desc' }
          ],
          take: 10
        });
      }
      
      return recommendations.map(mod => ({
        id: mod.id,
        name: mod.name,
        category: mod.category,
        brand: mod.brand,
        
        // Use learned data preferentially
        expectedPowerGain: mod.actualPowerGain || mod.predictedPowerGain,
        expectedTorqueGain: mod.actualTorqueGain || mod.predictedTorqueGain,
        estimatedCost: mod.actualCost || mod.predictedCost,
        
        // Learning metadata
        confidence: mod.confidenceLevel,
        accuracy: mod.accuracy,
        basedOnInstalls: mod.totalInstalls,
        dynoConfirmed: mod.dynoResultCount,
        popularityScore: mod.popularityScore,
        
        // Recommendation quality
        dataQuality: mod.dynoResultCount > 0 ? 'Dyno-Verified' : 
                    mod.totalInstalls > 0 ? 'User-Tested' : 'AI-Predicted',
        recommendationStrength: this.calculateRecommendationStrength(mod)
      }));
      
    } catch (error) {
      console.error('Failed to get smart recommendations:', error);
      return [];
    }
  }
  
  /**
   * Calculate recommendation strength based on learning data
   */
  private static calculateRecommendationStrength(mod: any): number {
    let strength = 0;
    
    // Base confidence
    strength += mod.confidenceLevel * 40;
    
    // Accuracy bonus
    if (mod.accuracy) strength += mod.accuracy * 30;
    
    // Real data bonus
    if (mod.dynoResultCount > 0) strength += Math.min(mod.dynoResultCount * 5, 20);
    if (mod.totalInstalls > 0) strength += Math.min(mod.totalInstalls * 2, 10);
    
    return Math.min(strength, 100);
  }
  
  /**
   * Get learning system statistics
   */
  static async getLearningStats() {
    const totalMods = await prisma.modificationDatabase.count();
    const dynoVerified = await prisma.modificationDatabase.count({
      where: { dynoResultCount: { gt: 0 } }
    });
    const highAccuracy = await prisma.modificationDatabase.count({
      where: { accuracy: { gt: 0.8 } }
    });
    const totalDynoResults = await prisma.dynoResult.count();
    
    const avgAccuracy = await prisma.modificationDatabase.aggregate({
      _avg: { accuracy: true }
    });
    
    return {
      totalModifications: totalMods,
      dynoVerifiedMods: dynoVerified,
      highAccuracyMods: highAccuracy,
      totalDynoResults,
      averageAccuracy: avgAccuracy._avg.accuracy || 0,
      verificationRate: totalMods > 0 ? dynoVerified / totalMods : 0,
      learningSystemHealth: totalMods > 0 ? (dynoVerified + highAccuracy) / totalMods : 0
    };
  }
}

export default ModificationLearningService;