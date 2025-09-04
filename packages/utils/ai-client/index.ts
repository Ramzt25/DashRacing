import { z } from 'zod';

// AI Provider configuration
export interface AIConfig {
  apiBase: string;
  apiKey: string;
  model?: string;
  timeout?: number;
}

// Vehicle resolution schemas
export const VehicleResolveInputSchema = z.object({
  vin: z.string().optional(),
  make: z.string().optional(),
  model: z.string().optional(),
  year: z.number().optional(),
  region: z.string().default('us'),
});

export const VehicleResolveOutputSchema = z.object({
  make: z.string(),
  model: z.string(),
  year: z.number(),
  trim: z.string(),
  specs: z.object({
    engine: z.object({
      type: z.string(),
      displacement: z.number(),
      cylinders: z.number(),
      horsepower: z.number().optional(),
      torque: z.number().optional(),
    }).optional(),
    transmission: z.object({
      type: z.enum(['manual', 'automatic', 'cvt']),
      speeds: z.number(),
    }).optional(),
    drivetrain: z.enum(['fwd', 'rwd', 'awd', '4wd']).optional(),
    weight: z.number().optional(),
    options: z.array(z.string()).optional(),
  }).optional(),
});

// Upgrades suggestion schemas
export const UpgradesSuggestInputSchema = z.object({
  vehicleSpec: VehicleResolveOutputSchema,
  goals: z.array(z.string()).default([]),
  budget: z.number().optional(),
  experience: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
});

export const UpgradesSuggestOutputSchema = z.object({
  recommendations: z.array(z.object({
    category: z.enum(['performance', 'handling', 'braking', 'aesthetics']),
    name: z.string(),
    description: z.string(),
    cost: z.number(),
    difficulty: z.enum(['Easy', 'Moderate', 'Hard', 'Expert']),
    priority: z.enum(['High', 'Medium', 'Low']),
    compatibility: z.enum(['Direct fit', 'Minor modifications', 'Major modifications']),
    reliability: z.enum(['Excellent', 'Good', 'Fair', 'Poor']),
    installTime: z.string(),
    requiredTools: z.array(z.string()),
    performanceGain: z.object({
      acceleration: z.string().optional(),
      topSpeed: z.string().optional(),
      throttleResponse: z.string().optional(),
    }).optional(),
  })),
  totalCost: z.number(),
  timeframe: z.string(),
  expertInsights: z.array(z.string()),
  nextSteps: z.array(z.string()),
});

export type VehicleResolveInput = z.infer<typeof VehicleResolveInputSchema>;
export type VehicleResolveOutput = z.infer<typeof VehicleResolveOutputSchema>;
export type UpgradesSuggestInput = z.infer<typeof UpgradesSuggestInputSchema>;
export type UpgradesSuggestOutput = z.infer<typeof UpgradesSuggestOutputSchema>;

/**
 * AI Client for vehicle resolution and upgrades suggestions
 * Supports pluggable backends with OpenAI-compatible endpoints
 */
export class AIClient {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = {
      model: 'gpt-4',
      timeout: 30000,
      ...config,
    };
  }

  /**
   * Resolve vehicle specifications from VIN or Make/Model/Year
   */
  async resolveVehicle(
    input: VehicleResolveInput
  ): Promise<VehicleResolveOutput> {
    // Validate input
    const validatedInput = VehicleResolveInputSchema.parse(input);

    if (!validatedInput.vin && (!validatedInput.make || !validatedInput.model || !validatedInput.year)) {
      throw new Error('Either VIN or Make/Model/Year is required');
    }

    const prompt = this.buildVehicleResolvePrompt(validatedInput);
    const response = await this.callAI(prompt);
    
    return VehicleResolveOutputSchema.parse(response);
  }

  /**
   * Generate upgrade suggestions for a vehicle (Premium only)
   */
  async suggestUpgrades(
    input: UpgradesSuggestInput
  ): Promise<UpgradesSuggestOutput> {
    const validatedInput = UpgradesSuggestInputSchema.parse(input);
    
    const prompt = this.buildUpgradesSuggestPrompt(validatedInput);
    const response = await this.callAI(prompt);
    
    return UpgradesSuggestOutputSchema.parse(response);
  }

  private buildVehicleResolvePrompt(input: VehicleResolveInput): string {
    const identifier = input.vin 
      ? `VIN: ${input.vin}`
      : `${input.make} ${input.model} ${input.year}`;

    return `
You are an automotive database expert. Resolve the following vehicle to its exact trim and specifications.

Vehicle: ${identifier}
Region: ${input.region}

Return ONLY a JSON object with the following structure:
{
  "make": "string",
  "model": "string", 
  "year": number,
  "trim": "string (exact trim level)",
  "specs": {
    "engine": {
      "type": "string",
      "displacement": number,
      "cylinders": number,
      "horsepower": number,
      "torque": number
    },
    "transmission": {
      "type": "manual|automatic|cvt",
      "speeds": number
    },
    "drivetrain": "fwd|rwd|awd|4wd",
    "weight": number,
    "options": ["array", "of", "standard", "options"]
  }
}

Be as accurate as possible. If uncertain about specific values, omit them rather than guess.
    `.trim();
  }

  private buildUpgradesSuggestPrompt(input: UpgradesSuggestInput): string {
    const vehicle = `${input.vehicleSpec.make} ${input.vehicleSpec.model} ${input.vehicleSpec.year} ${input.vehicleSpec.trim}`;
    const budget = input.budget ? `Budget: $${input.budget}` : 'No budget specified';
    const goals = input.goals.length > 0 ? `Goals: ${input.goals.join(', ')}` : 'General improvement';

    return `
You are a professional automotive performance tuner with 20+ years of experience. 
Provide upgrade recommendations for the following vehicle.

Vehicle: ${vehicle}
${budget}
${goals}
Experience Level: ${input.experience}

Consider:
1. Realistic power gains and costs
2. Appropriate difficulty for experience level
3. Modifications that align with stated goals
4. Vehicle-specific compatibility and reliability

Return ONLY a JSON object with this exact structure:
{
  "recommendations": [
    {
      "category": "performance|handling|braking|aesthetics",
      "name": "string",
      "description": "string",
      "cost": number,
      "difficulty": "Easy|Moderate|Hard|Expert",
      "priority": "High|Medium|Low",
      "compatibility": "Direct fit|Minor modifications|Major modifications",
      "reliability": "Excellent|Good|Fair|Poor",
      "installTime": "string",
      "requiredTools": ["array"],
      "performanceGain": {
        "acceleration": "string",
        "topSpeed": "string", 
        "throttleResponse": "string"
      }
    }
  ],
  "totalCost": number,
  "timeframe": "string",
  "expertInsights": ["array", "of", "insights"],
  "nextSteps": ["array", "of", "steps"]
}

Limit to 5-8 realistic recommendations prioritized by value and safety.
    `.trim();
  }

  private async callAI(prompt: string): Promise<any> {
    const response = await fetch(`${this.config.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that responds only with valid JSON. No additional text or formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON response from AI: ${error}`);
    }
  }
}