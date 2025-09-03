import React, { useState } from 'react';
import { 
  Trophy,
  Star,
  Gift,
  Crown,
  Flame,
  Target,
  Award,
  CheckCircle,
  ShoppingCart,
  TrendingUp,
  Heart
} from 'lucide-react';

interface UserRewards {
  totalPoints: number;
  currentTier: 'Bronze' | 'Silver' | 'Gold';
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  availableRedemptions: Redemption[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  earned: boolean;
  earnedDate?: string;
  points: number;
  category: 'streak' | 'consistency' | 'milestone' | 'tbreak' | 'ecs';
}

interface Redemption {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  discountAmount: number;
  type: 'subscription' | 'oneTime' | 'shipping';
  available: boolean;
  timesUsed: number;
  maxUses?: number;
}

const RewardsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'badges' | 'redemptions'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const userRewards: UserRewards = {
    totalPoints: 2750,
    currentTier: 'Silver',
    currentStreak: 12,
    longestStreak: 28,
    badges: [
      {
        id: 'first-checkin',
        name: 'First Steps',
        description: 'Complete your first daily check-in',
        icon: CheckCircle,
        color: 'text-green-500',
        earned: true,
        earnedDate: '2024-01-01',
        points: 50,
        category: 'milestone'
      },
      {
        id: 'week-warrior',
        name: 'Week Warrior',
        description: 'Maintain a 7-day check-in streak',
        icon: Flame,
        color: 'text-orange-500',
        earned: true,
        earnedDate: '2024-01-07',
        points: 100,
        category: 'streak'
      },
      {
        id: 'ecs-optimizer',
        name: 'ECS Optimizer',
        description: 'Achieve 85+ ECS Impact Score',
        icon: Target,
        color: 'text-blue-500',
        earned: true,
        earnedDate: '2024-01-10',
        points: 150,
        category: 'ecs'
      },
      {
        id: 'consistency-master',
        name: 'Consistency Master',
        description: 'Complete supplement plan 30 days in a row',
        icon: Star,
        color: 'text-purple-500',
        earned: false,
        points: 250,
        category: 'consistency'
      },
      {
        id: 'tbreak-champion',
        name: 'T-Break Champion',
        description: 'Complete a 21-day tolerance break',
        icon: Crown,
        color: 'text-yellow-500',
        earned: false,
        points: 500,
        category: 'tbreak'
      },
      {
        id: 'streak-legend',
        name: 'Streak Legend',
        description: 'Maintain a 30-day streak',
        icon: Trophy,
        color: 'text-gold-500',
        earned: false,
        points: 1000,
        category: 'streak'
      }
    ],
    availableRedemptions: [
      {
        id: 'sub-5-off',
        name: '$5 Off Subscription',
        description: 'Get $5 off your next monthly subscription renewal',
        pointsCost: 500,
        discountAmount: 5,
        type: 'subscription',
        available: true,
        timesUsed: 1,
        maxUses: 12
      },
      {
        id: 'sub-10-off',
        name: '$10 Off Subscription',
        description: 'Get $10 off your next monthly subscription renewal',
        pointsCost: 1000,
        discountAmount: 10,
        type: 'subscription',
        available: true,
        timesUsed: 0,
        maxUses: 6
      },
      {
        id: 'free-shipping',
        name: 'Free Shipping',
        description: 'Free shipping on your next one-time order',
        pointsCost: 300,
        discountAmount: 0,
        type: 'shipping',
        available: true,
        timesUsed: 2
      },
      {
        id: 'sub-20-off',
        name: '$20 Off Subscription',
        description: 'Get $20 off your next monthly subscription renewal',
        pointsCost: 2000,
        discountAmount: 20,
        type: 'subscription',
        available: true,
        timesUsed: 0,
        maxUses: 3
      }
    ]
  };

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'Bronze':
        return { color: 'text-orange-600', nextTier: 'Silver', pointsNeeded: 1500 - userRewards.totalPoints };
      case 'Silver':
        return { color: 'text-gray-500', nextTier: 'Gold', pointsNeeded: 3000 - userRewards.totalPoints };
      case 'Gold':
        return { color: 'text-yellow-500', nextTier: null, pointsNeeded: 0 };
      default:
        return { color: 'text-gray-400', nextTier: 'Bronze', pointsNeeded: 500 };
    }
  };

  const tierInfo = getTierInfo(userRewards.currentTier);

  const redeemPoints = (redemption: Redemption) => {
    if (userRewards.totalPoints >= redemption.pointsCost) {
      console.log(`Redeeming ${redemption.name} for ${redemption.pointsCost} points`);
      // API call would happen here
      alert(`Successfully redeemed ${redemption.name}! Check your email for the discount code.`);
    }
  };

  const filteredBadges = userRewards.badges.filter(badge => 
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  const earnedBadges = userRewards.badges.filter(badge => badge.earned);
  const totalBadgePoints = earnedBadges.reduce((sum, badge) => sum + badge.points, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards & Achievements</h1>
        <p className="text-lg text-gray-600">Track your progress and redeem points for exclusive benefits</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: TrendingUp },
            { id: 'badges', name: 'Badges', icon: Award },
            { id: 'redemptions', name: 'Redeem Points', icon: Gift }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Total Points</h3>
              <p className="text-2xl font-bold text-green-600">{userRewards.totalPoints.toLocaleString()}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Crown className={`h-8 w-8 ${tierInfo.color} mx-auto mb-3`} />
              <h3 className="text-lg font-semibold text-gray-900">Current Tier</h3>
              <p className={`text-2xl font-bold ${tierInfo.color}`}>{userRewards.currentTier}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Flame className="h-8 w-8 text-orange-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Current Streak</h3>
              <p className="text-2xl font-bold text-orange-600">{userRewards.currentStreak} days</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Award className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Badges Earned</h3>
              <p className="text-2xl font-bold text-blue-600">{earnedBadges.length}/{userRewards.badges.length}</p>
            </div>
          </div>

          {/* Tier Progress */}
          {tierInfo.nextTier && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Progress to {tierInfo.nextTier}</h3>
                <span className="text-sm text-gray-600">{tierInfo.pointsNeeded} points needed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(((userRewards.totalPoints % 1500) / 1500) * 100, 100)}%` 
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Unlock exclusive benefits and higher discount rates at {tierInfo.nextTier} tier
              </p>
            </div>
          )}

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {earnedBadges.slice(-3).map(badge => (
                  <div key={badge.id} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                    <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shadow`}>
                      <badge.icon className={`h-6 w-6 ${badge.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{badge.name}</h4>
                      <p className="text-sm text-gray-600">{badge.description}</p>
                      <p className="text-xs text-green-600">Earned {badge.earnedDate} • +{badge.points} points</p>
                    </div>
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Points Breakdown */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Points Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Daily Check-ins</h4>
                  <p className="text-2xl font-bold text-blue-600">1,250</p>
                  <p className="text-sm text-gray-600">From supplement tracking</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Badges</h4>
                  <p className="text-2xl font-bold text-purple-600">{totalBadgePoints}</p>
                  <p className="text-sm text-gray-600">From achievements</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Heart className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Streaks</h4>
                  <p className="text-2xl font-bold text-green-600">1,200</p>
                  <p className="text-sm text-gray-600">From consistency bonuses</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Badges Tab */}
      {selectedTab === 'badges' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['all', 'milestone', 'streak', 'consistency', 'tbreak', 'ecs'].map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBadges.map(badge => (
              <div 
                key={badge.id}
                className={`bg-white rounded-lg shadow p-6 transition-all ${
                  badge.earned 
                    ? 'ring-2 ring-green-200 bg-green-50' 
                    : 'opacity-75 hover:opacity-100'
                }`}
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    badge.earned ? 'bg-white shadow-lg' : 'bg-gray-100'
                  }`}>
                    <badge.icon className={`h-8 w-8 ${badge.earned ? badge.color : 'text-gray-400'}`} />
                  </div>
                  
                  <h3 className={`text-lg font-semibold mb-2 ${
                    badge.earned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {badge.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                  
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">{badge.points} points</span>
                  </div>
                  
                  {badge.earned ? (
                    <div className="mt-4 flex items-center justify-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Earned {badge.earnedDate}</span>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <span className="text-sm text-gray-500">Not earned yet</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redemptions Tab */}
      {selectedTab === 'redemptions' && (
        <div className="space-y-6">
          {/* Available Points */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Available Points</h3>
            <p className="text-4xl font-bold">{userRewards.totalPoints.toLocaleString()}</p>
            <p className="text-lg opacity-90 mt-2">Ready to redeem for exclusive benefits</p>
          </div>

          {/* Redemption Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRewards.availableRedemptions.map(redemption => {
              const canAfford = userRewards.totalPoints >= redemption.pointsCost;
              const isLimited = redemption.maxUses && redemption.timesUsed >= redemption.maxUses;
              
              return (
                <div 
                  key={redemption.id}
                  className={`bg-white rounded-lg shadow p-6 transition-all ${
                    canAfford && !isLimited ? 'hover:shadow-lg' : 'opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{redemption.name}</h3>
                      <p className="text-sm text-gray-600">{redemption.description}</p>
                    </div>
                    <Gift className="h-6 w-6 text-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <span className="text-lg font-bold text-gray-900">{redemption.pointsCost} points</span>
                    </div>
                    {redemption.discountAmount > 0 && (
                      <span className="text-green-600 font-bold">${redemption.discountAmount} OFF</span>
                    )}
                  </div>

                  {redemption.maxUses && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Uses remaining</span>
                        <span>{redemption.maxUses - redemption.timesUsed}/{redemption.maxUses}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ 
                            width: `${((redemption.maxUses - redemption.timesUsed) / redemption.maxUses) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => redeemPoints(redemption)}
                    disabled={!canAfford || !!isLimited}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
                      canAfford && !isLimited
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>
                      {!canAfford 
                        ? `Need ${redemption.pointsCost - userRewards.totalPoints} more points`
                        : isLimited
                        ? 'No uses remaining'
                        : 'Redeem Now'
                      }
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* How to Earn Points */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">How to Earn More Points</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Daily Check-ins</h4>
                  <p className="text-sm text-gray-600">10-15 points per supplement tracked</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Maintain Streaks</h4>
                  <p className="text-sm text-gray-600">Bonus multipliers for consistency</p>
                </div>
                <div className="text-center p-4 border border-gray-200 rounded-lg">
                  <Award className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Earn Badges</h4>
                  <p className="text-sm text-gray-600">50-1000 points per achievement</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsPage;