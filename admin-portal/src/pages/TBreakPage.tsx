import React, { useState } from 'react';
import { 
  Calendar,
  Target,
  Trophy,
  Flame,
  CheckCircle,
  TrendingUp,
  Play,
  Pause,
  RotateCcw,
  Star
} from 'lucide-react';

interface TBreakSession {
  id: string;
  startDate: string;
  endDate?: string;
  goalDays: number;
  currentDay: number;
  status: 'active' | 'completed' | 'paused';
  pointsEarned: number;
  milestones: TBreakMilestone[];
}

interface TBreakMilestone {
  day: number;
  title: string;
  description: string;
  points: number;
  achieved: boolean;
  achievedDate?: string;
}

interface DailyProgress {
  day: number;
  date: string;
  mood: number;
  energy: number;
  sleep: number;
  cravings: number;
  notes: string;
  completed: boolean;
}

const TBreakPage: React.FC = () => {
  const [activeSession, setActiveSession] = useState<TBreakSession | null>({
    id: 'tbreak-001',
    startDate: '2024-01-01',
    goalDays: 21,
    currentDay: 7,
    status: 'active',
    pointsEarned: 350,
    milestones: [
      { day: 1, title: 'First Day', description: 'You took the first step!', points: 50, achieved: true, achievedDate: '2024-01-01' },
      { day: 3, title: 'Three Days Strong', description: 'Building momentum', points: 75, achieved: true, achievedDate: '2024-01-03' },
      { day: 7, title: 'One Week Warrior', description: 'First week complete!', points: 100, achieved: true, achievedDate: '2024-01-07' },
      { day: 14, title: 'Two Week Titan', description: 'Halfway to three weeks', points: 150, achieved: false },
      { day: 21, title: 'Three Week Champion', description: 'Full cycle complete!', points: 250, achieved: false },
      { day: 30, title: 'Month Master', description: 'Extended reset achieved', points: 500, achieved: false },
    ]
  });

  const [showStartModal, setShowStartModal] = useState(false);
  const [newGoalDays, setNewGoalDays] = useState(21);

  const startNewTBreak = () => {
    const newSession: TBreakSession = {
      id: `tbreak-${Date.now()}`,
      startDate: new Date().toISOString().split('T')[0],
      goalDays: newGoalDays,
      currentDay: 1,
      status: 'active',
      pointsEarned: 0,
      milestones: [
        { day: 1, title: 'First Day', description: 'You took the first step!', points: 50, achieved: false },
        { day: 3, title: 'Three Days Strong', description: 'Building momentum', points: 75, achieved: false },
        { day: 7, title: 'One Week Warrior', description: 'First week complete!', points: 100, achieved: false },
        { day: 14, title: 'Two Week Titan', description: 'Halfway to three weeks', points: 150, achieved: false },
        { day: 21, title: 'Three Week Champion', description: 'Full cycle complete!', points: 250, achieved: false },
        { day: 30, title: 'Month Master', description: 'Extended reset achieved', points: 500, achieved: false },
      ]
    };
    setActiveSession(newSession);
    setShowStartModal(false);
  };

  const pauseTBreak = () => {
    if (activeSession) {
      setActiveSession({ ...activeSession, status: 'paused' });
    }
  };

  const resumeTBreak = () => {
    if (activeSession) {
      setActiveSession({ ...activeSession, status: 'active' });
    }
  };

  const endTBreak = () => {
    if (activeSession) {
      setActiveSession({ 
        ...activeSession, 
        status: 'completed',
        endDate: new Date().toISOString().split('T')[0]
      });
    }
  };

  const getProgressPercentage = () => {
    if (!activeSession) return 0;
    return Math.min((activeSession.currentDay / activeSession.goalDays) * 100, 100);
  };

  const getNextMilestone = () => {
    if (!activeSession) return null;
    return activeSession.milestones.find(m => !m.achieved && m.day > activeSession.currentDay);
  };

  const getDaysUntilNext = () => {
    const next = getNextMilestone();
    if (!next || !activeSession) return 0;
    return next.day - activeSession.currentDay;
  };

  // Mock daily progress data
  const dailyProgress: DailyProgress[] = [
    { day: 1, date: '2024-01-01', mood: 6, energy: 5, sleep: 7, cravings: 8, notes: 'Feeling motivated to start!', completed: true },
    { day: 2, date: '2024-01-02', mood: 5, energy: 4, sleep: 6, cravings: 7, notes: 'Some cravings but staying strong', completed: true },
    { day: 3, date: '2024-01-03', mood: 7, energy: 6, sleep: 8, cravings: 6, notes: 'Sleep is improving', completed: true },
    { day: 4, date: '2024-01-04', mood: 6, energy: 5, sleep: 7, cravings: 5, notes: 'Cravings decreasing', completed: true },
    { day: 5, date: '2024-01-05', mood: 7, energy: 7, sleep: 8, cravings: 4, notes: 'Feeling clearer mentally', completed: true },
    { day: 6, date: '2024-01-06', mood: 8, energy: 7, sleep: 9, cravings: 3, notes: 'Great sleep and energy!', completed: true },
    { day: 7, date: '2024-01-07', mood: 8, energy: 8, sleep: 8, cravings: 3, notes: 'One week milestone achieved!', completed: true },
  ];

  if (!activeSession) {
    return (
      <div className="space-y-6">
        {/* No Active T-Break */}
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Calendar className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ready for a T-Break?</h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Tolerance breaks help reset your endocannabinoid system, improve sensitivity, and boost the effectiveness of your supplements.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Target className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Reset Tolerance</h3>
              <p className="text-sm text-gray-600">Allow your CB1 and CB2 receptors to return to baseline sensitivity</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Boost ECS Function</h3>
              <p className="text-sm text-gray-600">Enhanced endocannabinoid production and receptor responsiveness</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Earn Rewards</h3>
              <p className="text-sm text-gray-600">Gamified tracking with points, badges, and milestone rewards</p>
            </div>
          </div>

          <button
            onClick={() => setShowStartModal(true)}
            className="bg-green-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-green-700 transition-colors text-lg"
          >
            Start T-Break Journey
          </button>
        </div>

        {/* Start Modal */}
        {showStartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Start Your T-Break</h2>
              <p className="text-gray-600 mb-6">Choose your goal duration. You can always extend or modify later.</p>
              
              <div className="space-y-4 mb-6">
                {[7, 14, 21, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => setNewGoalDays(days)}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                      newGoalDays === days 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-900">{days} Days</div>
                        <div className="text-sm text-gray-600">
                          {days === 7 && 'Perfect for beginners'}
                          {days === 14 && 'Solid reset period'}
                          {days === 21 && 'Recommended standard'}
                          {days === 30 && 'Complete system reset'}
                        </div>
                      </div>
                      {newGoalDays === days && <CheckCircle className="h-5 w-5 text-green-500" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowStartModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={startNewTBreak}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                >
                  Start T-Break
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">T-Break Tracker</h1>
          <p className="text-gray-600">Day {activeSession.currentDay} of your {activeSession.goalDays}-day tolerance break</p>
        </div>
        
        <div className="flex space-x-2">
          {activeSession.status === 'active' && (
            <button
              onClick={pauseTBreak}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </button>
          )}
          {activeSession.status === 'paused' && (
            <button
              onClick={resumeTBreak}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </button>
          )}
          <button
            onClick={endTBreak}
            className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            End T-Break
          </button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Day</p>
              <p className="text-2xl font-bold text-gray-900">{activeSession.currentDay}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{getProgressPercentage().toFixed(0)}%</p>
            </div>
            <Target className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Points Earned</p>
              <p className="text-2xl font-bold text-gray-900">{activeSession.pointsEarned}</p>
            </div>
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Days to Next</p>
              <p className="text-2xl font-bold text-gray-900">{getDaysUntilNext()}</p>
            </div>
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Progress to Goal</h3>
          <span className="text-sm text-gray-600">{activeSession.currentDay}/{activeSession.goalDays} days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        {getNextMilestone() && (
          <p className="text-sm text-gray-600 mt-2">
            Next milestone: {getNextMilestone()?.title} in {getDaysUntilNext()} days (+{getNextMilestone()?.points} points)
          </p>
        )}
      </div>

      {/* Milestones */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Milestones</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activeSession.milestones.map(milestone => (
              <div 
                key={milestone.day}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  milestone.achieved 
                    ? 'bg-green-50 border border-green-200' 
                    : milestone.day <= activeSession.currentDay
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    milestone.achieved 
                      ? 'bg-green-500 text-white' 
                      : milestone.day <= activeSession.currentDay
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {milestone.achieved ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-bold">{milestone.day}</span>
                    )}
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      milestone.achieved ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {milestone.title}
                    </h4>
                    <p className="text-sm text-gray-600">{milestone.description}</p>
                    {milestone.achievedDate && (
                      <p className="text-xs text-green-600">Achieved on {milestone.achievedDate}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-gray-900">{milestone.points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Progress Chart */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daily Progress</h3>
          <p className="text-sm text-gray-600">Track your mood, energy, sleep, and cravings throughout your journey</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {dailyProgress.slice(-5).map(day => (
              <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Day {day.day}</h4>
                    <p className="text-sm text-gray-600">{day.date}</p>
                  </div>
                  {day.completed && <CheckCircle className="h-5 w-5 text-green-500" />}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Mood</p>
                    <p className="text-lg font-bold text-gray-900">{day.mood}/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Energy</p>
                    <p className="text-lg font-bold text-gray-900">{day.energy}/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Sleep</p>
                    <p className="text-lg font-bold text-gray-900">{day.sleep}/10</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600">Cravings</p>
                    <p className="text-lg font-bold text-red-600">{day.cravings}/10</p>
                  </div>
                </div>
                
                {day.notes && (
                  <p className="text-sm text-gray-600 italic">"{day.notes}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Check-in CTA */}
      {activeSession.status === 'active' && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Ready for today's check-in?</h3>
          <p className="mb-4">Log your mood, energy, and progress to earn daily T-break points!</p>
          <button className="bg-white text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
            Complete Day {activeSession.currentDay} Check-In
          </button>
        </div>
      )}
    </div>
  );
};

export default TBreakPage;