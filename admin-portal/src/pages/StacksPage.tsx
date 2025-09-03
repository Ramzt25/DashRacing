import React, { useState } from 'react';
import { 
  Heart, 
  CheckCircle,
  Star,
  ShoppingCart,
  Target,
  Brain,
  Shield,
  Moon,
  Zap
} from 'lucide-react';

interface Supplement {
  id: string;
  name: string;
  description: string;
  timing: string;
  ecsImpact: {
    absorption?: number;
    antioxidant?: number;
    neuro?: number;
    gut?: number;
    sleep?: number;
  };
}

interface SupplementStack {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: {
    oneTime: number;
    subscription: number;
    savings: number;
  };
  supplements: Supplement[];
  ecsScore: number;
  popular?: boolean;
  recommended?: boolean;
}

const StacksPage: React.FC = () => {
  const [selectedStack, setSelectedStack] = useState<string | null>(null);

  const stacks: SupplementStack[] = [
    {
      id: 'core',
      name: 'CannaBalance Core',
      subtitle: 'ECS Foundation',
      description: 'Daily endocannabinoid support that improves cannabinoid absorption and baseline signaling.',
      price: {
        oneTime: 79,
        subscription: 69,
        savings: 10
      },
      supplements: [
        {
          id: 'omega3',
          name: 'Omega-3 Fish Oil',
          description: 'Essential fatty acids for ECS membrane health',
          timing: 'AM with food',
          ecsImpact: { absorption: 25, neuro: 15 }
        },
        {
          id: 'magnesium',
          name: 'Magnesium Glycinate', 
          description: 'Supports GABA and cannabinoid receptor function',
          timing: 'PM before bed',
          ecsImpact: { neuro: 20, sleep: 25 }
        },
        {
          id: 'multivitamin',
          name: 'Multivitamin (Ultra)',
          description: 'Comprehensive micronutrient support for ECS synthesis',
          timing: 'AM with food',
          ecsImpact: { absorption: 15, antioxidant: 10 }
        },
        {
          id: 'probiotic',
          name: 'Probiotic 40B CFU',
          description: 'Gut-brain axis support for optimal cannabinoid metabolism',
          timing: 'AM with food',
          ecsImpact: { gut: 30, absorption: 10 }
        }
      ],
      ecsScore: 68,
      recommended: true
    },
    {
      id: 'premium',
      name: 'CannaBalance Premium',
      subtitle: 'Absorb & Resilience',
      description: 'Add absorption (MCT) + adaptogen & neuro support to stabilize mood and sensitivity.',
      price: {
        oneTime: 129,
        subscription: 109,
        savings: 20
      },
      supplements: [
        // All Core supplements plus:
        {
          id: 'ashwagandha',
          name: 'Ashwagandha',
          description: 'Adaptogenic stress support and cortisol regulation',
          timing: 'Midday',
          ecsImpact: { neuro: 25, antioxidant: 15 }
        },
        {
          id: 'mushroom',
          name: 'Mushroom Immune Booster',
          description: 'Lion\'s Mane, Cordyceps, Reishi, Chaga for cognitive support',
          timing: 'AM',
          ecsImpact: { neuro: 20, antioxidant: 20 }
        },
        {
          id: 'mct',
          name: 'MCT Oil',
          description: 'Medium-chain triglycerides for enhanced cannabinoid absorption',
          timing: 'Midday with first meal',
          ecsImpact: { absorption: 35 }
        }
      ],
      ecsScore: 78,
      popular: true
    },
    {
      id: 'elite',
      name: 'CannaBalance Elite',
      subtitle: 'Reset & Protect',
      description: 'Full recovery stack: antioxidant/phase-II detox + sleep for nightly receptor maintenance.',
      price: {
        oneTime: 179,
        subscription: 149,
        savings: 30
      },
      supplements: [
        // All Premium supplements plus:
        {
          id: 'nac',
          name: 'NAC (N-Acetyl Cysteine)',
          description: 'Powerful antioxidant and glutathione precursor for detox support',
          timing: 'PM with food',
          ecsImpact: { antioxidant: 30, neuro: 10 }
        },
        {
          id: 'glutathione',
          name: 'Glutathione Complex',
          description: 'Master antioxidant for cellular protection and ECS maintenance',
          timing: 'AM',
          ecsImpact: { antioxidant: 35, absorption: 15 }
        },
        {
          id: 'sleep',
          name: 'Sleep Formula',
          description: 'Targeted sleep support for nightly ECS restoration',
          timing: '30-60m pre-bed',
          ecsImpact: { sleep: 40, neuro: 15 }
        }
      ],
      ecsScore: 88
    }
  ];

  const calculateECSImpact = (supplements: Supplement[]) => {
    const totals = supplements.reduce((acc, supp) => {
      Object.entries(supp.ecsImpact).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    }, {} as Record<string, number>);

    // ECS Impact Score weights: Absorption 40%, Antioxidant 25%, Neuro/Stress 20%, Gut 10%, Sleep 5%
    const score = Math.round(
      (totals.absorption || 0) * 0.4 +
      (totals.antioxidant || 0) * 0.25 +
      (totals.neuro || 0) * 0.2 +
      (totals.gut || 0) * 0.1 +
      (totals.sleep || 0) * 0.05
    );

    return { totals, score };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">ECS Support Stacks</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Evidence-based supplement combinations designed to support your Endocannabinoid System. 
          Each stack is formulated to maximize cannabinoid absorption and ECS function.
        </p>
      </div>

      {/* ECS Impact Score Explanation */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
          <Target className="h-5 w-5 mr-2" />
          ECS Impact Score Breakdown
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="flex items-center">
            <Zap className="h-4 w-4 text-orange-500 mr-2" />
            <span className="font-medium">Absorption 40%</span>
          </div>
          <div className="flex items-center">
            <Shield className="h-4 w-4 text-blue-500 mr-2" />
            <span className="font-medium">Antioxidant 25%</span>
          </div>
          <div className="flex items-center">
            <Brain className="h-4 w-4 text-purple-500 mr-2" />
            <span className="font-medium">Neuro/Stress 20%</span>
          </div>
          <div className="flex items-center">
            <Heart className="h-4 w-4 text-pink-500 mr-2" />
            <span className="font-medium">Gut Health 10%</span>
          </div>
          <div className="flex items-center">
            <Moon className="h-4 w-4 text-indigo-500 mr-2" />
            <span className="font-medium">Sleep 5%</span>
          </div>
        </div>
      </div>

      {/* Stacks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stacks.map((stack) => {
          const { score } = calculateECSImpact(stack.supplements);
          
          return (
            <div 
              key={stack.id} 
              className={`relative bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                selectedStack === stack.id ? 'border-green-500' : 'border-gray-200'
              } ${stack.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
            >
              {/* Popular Badge */}
              {stack.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Recommended Badge */}
              {stack.recommended && (
                <div className="absolute -top-3 right-4">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Recommended
                  </span>
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{stack.name}</h3>
                  <p className="text-sm font-medium text-green-600">{stack.subtitle}</p>
                  <p className="text-gray-600 mt-2 text-sm">{stack.description}</p>
                </div>

                {/* ECS Score */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-2">
                    <span className="text-2xl font-bold text-green-600">{score}</span>
                  </div>
                  <p className="text-sm text-gray-600">ECS Impact Score</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">${stack.price.subscription}</span>
                    <span className="text-sm text-gray-500">/month</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="line-through">${stack.price.oneTime}</span>
                    <span className="text-green-600 font-medium ml-2">Save ${stack.price.savings}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">with subscription</p>
                </div>

                {/* Key Supplements Preview */}
                <div className="space-y-2 mb-6">
                  <h4 className="font-medium text-gray-900 text-sm">Includes ({stack.supplements.length} supplements):</h4>
                  {stack.supplements.slice(0, 3).map((supplement) => (
                    <div key={supplement.id} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{supplement.name}</span>
                    </div>
                  ))}
                  {stack.supplements.length > 3 && (
                    <p className="text-sm text-gray-500 ml-6">+{stack.supplements.length - 3} more</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button 
                    onClick={() => setSelectedStack(stack.id)}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Start Subscription
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    View Full Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stack Builder CTA */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-4">Customize Your ECS Stack</h3>
        <p className="text-lg mb-6">
          Want to build your own combination? Use our interactive stack builder with live ECS Impact Score calculation.
        </p>
        <button className="bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
          Launch Stack Builder
        </button>
      </div>
    </div>
  );
};

export default StacksPage;