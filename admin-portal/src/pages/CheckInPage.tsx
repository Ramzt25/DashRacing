import React, { useState } from 'react';
import { 
  CheckCircle,
  Clock,
  Smile,
  Heart,
  Moon,
  Activity,
  Plus,
  Target,
  Trophy,
  Calendar
} from 'lucide-react';

interface SupplementCheckIn {
  id: string;
  name: string;
  timing: string;
  taken: boolean;
  time?: string;
  points: number;
}

interface MoodMetric {
  id: string;
  name: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

const CheckInPage: React.FC = () => {
  const [supplements, setSupplements] = useState<SupplementCheckIn[]>([
    { id: 'omega3', name: 'Omega-3 Fish Oil', timing: 'AM with food', taken: true, time: '8:30 AM', points: 10 },
    { id: 'multivitamin', name: 'Multivitamin', timing: 'AM with food', taken: true, time: '8:30 AM', points: 10 },
    { id: 'probiotic', name: 'Probiotic 40B CFU', timing: 'AM with food', taken: true, time: '8:30 AM', points: 15 },
    { id: 'ashwagandha', name: 'Ashwagandha', timing: 'Midday', taken: false, points: 15 },
    { id: 'mct', name: 'MCT Oil', timing: 'Midday with meal', taken: false, points: 10 },
    { id: 'magnesium', name: 'Magnesium Glycinate', timing: 'PM before bed', taken: false, points: 10 },
  ]);

  const [mood, setMood] = useState<MoodMetric[]>([
    { id: 'energy', name: 'Energy Level', value: 0, icon: Activity, color: 'text-orange-500' },
    { id: 'mood', name: 'Overall Mood', value: 0, icon: Smile, color: 'text-yellow-500' },
    { id: 'stress', name: 'Stress Level', value: 0, icon: Heart, color: 'text-red-500' },
    { id: 'sleep', name: 'Sleep Quality', value: 0, icon: Moon, color: 'text-indigo-500' },
  ]);

  const [todaysNotes, setTodaysNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSupplement = (id: string) => {
    setSupplements(prev => prev.map(supp => {
      if (supp.id === id) {
        const now = new Date();
        return {
          ...supp,
          taken: !supp.taken,
          time: !supp.taken ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined
        };
      }
      return supp;
    }));
  };

  const updateMoodMetric = (id: string, value: number) => {
    setMood(prev => prev.map(metric => 
      metric.id === id ? { ...metric, value } : metric
    ));
  };

  const handleSubmitCheckIn = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Calculate points earned
    const supplementPoints = supplements.filter(s => s.taken).reduce((sum, s) => sum + s.points, 0);
    const moodPoints = mood.filter(m => m.value > 0).length * 5; // 5 points per mood metric logged
    const totalPoints = supplementPoints + moodPoints;
    
    console.log('Check-in submitted:', {
      supplements: supplements.filter(s => s.taken),
      mood: mood.filter(m => m.value > 0),
      notes: todaysNotes,
      pointsEarned: totalPoints
    });
    
    setIsSubmitting(false);
    
    // Show success feedback (would typically show a toast/notification)
    alert(`Check-in complete! You earned ${totalPoints} points.`);
  };

  const completedSupplements = supplements.filter(s => s.taken).length;
  const totalSupplements = supplements.length;
  const completionPercentage = Math.round((completedSupplements / totalSupplements) * 100);
  
  const loggedMoods = mood.filter(m => m.value > 0).length;
  const averageMood = loggedMoods > 0 ? mood.reduce((sum, m) => sum + m.value, 0) / loggedMoods : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Check-In</h1>
          <p className="text-gray-600">Track your supplements and mood to earn points and improve your ECS</p>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">Today's Progress</div>
          <div className="text-2xl font-bold text-green-600">{completionPercentage}%</div>
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Supplements</p>
              <p className="text-xl font-bold text-gray-900">{completedSupplements}/{totalSupplements}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Mood</p>
              <p className="text-xl font-bold text-gray-900">{averageMood.toFixed(1)}/10</p>
            </div>
            <Smile className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Points Today</p>
              <p className="text-xl font-bold text-gray-900">
                {supplements.filter(s => s.taken).reduce((sum, s) => sum + s.points, 0) + (loggedMoods * 5)}
              </p>
            </div>
            <Trophy className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-xl font-bold text-gray-900">7 days</p>
            </div>
            <Calendar className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Supplement Checklist */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Today's Supplement Plan</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Target className="h-4 w-4" />
              <span>{completedSupplements}/{totalSupplements} completed</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="space-y-3">
            {supplements.map(supplement => (
              <div 
                key={supplement.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  supplement.taken 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleSupplement(supplement.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      supplement.taken
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {supplement.taken && <CheckCircle className="h-4 w-4" />}
                  </button>
                  
                  <div>
                    <h4 className={`font-medium ${supplement.taken ? 'text-gray-600 line-through' : 'text-gray-900'}`}>
                      {supplement.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{supplement.timing}</span>
                      {supplement.time && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">Taken at {supplement.time}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">+{supplement.points} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mood Tracking */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">How are you feeling today?</h3>
          <p className="text-sm text-gray-600">Rate each area from 1-10 to track your progress</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mood.map(metric => (
              <div key={metric.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                    <span className="font-medium text-gray-900">{metric.name}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {metric.value > 0 ? metric.value : '-'}/10
                  </span>
                </div>
                
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(value => (
                    <button
                      key={value}
                      onClick={() => updateMoodMetric(metric.id, value)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                        metric.value === value
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Daily Notes</h3>
          <p className="text-sm text-gray-600">Any observations about your day, mood, or supplement effects?</p>
        </div>
        
        <div className="p-6">
          <textarea
            value={todaysNotes}
            onChange={(e) => setTodaysNotes(e.target.value)}
            placeholder="How did your supplements make you feel today? Any changes in mood, energy, or sleep?"
            className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmitCheckIn}
          disabled={isSubmitting || (completedSupplements === 0 && loggedMoods === 0)}
          className="bg-green-600 text-white font-bold py-4 px-12 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Complete Check-In</span>
            </>
          )}
        </button>
      </div>

      {/* Points Preview */}
      {(completedSupplements > 0 || loggedMoods > 0) && (
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Great Progress!</h3>
          <p className="text-lg">
            You'll earn {supplements.filter(s => s.taken).reduce((sum, s) => sum + s.points, 0) + (loggedMoods * 5)} points 
            for today's check-in
          </p>
          <p className="text-sm opacity-90 mt-2">
            Keep your streak going to unlock bonus multipliers!
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;