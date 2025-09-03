import React from 'react';
import { useQuery } from 'react-query';
import { 
  Heart, 
  Pill, 
  Trophy, 
  Target,
  Activity,
  Clock,
  Flame,
  Award
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { data: userStats, isLoading: statsLoading } = useQuery(
    'userStats',
    () => apiService.getUserStats('current-user'), // Using placeholder ID
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const { data: todaysProgress, isLoading: progressLoading } = useQuery(
    'todaysProgress',
    () => Promise.resolve({
      supplementsTaken: 3,
      plan: [
        { name: 'Omega-3 Fish Oil', timing: 'AM with food', completed: true, description: 'Essential fatty acids for ECS membrane health' },
        { name: 'Magnesium Glycinate', timing: 'PM before bed', completed: false, description: 'Supports GABA and cannabinoid receptor function' },
      ]
    }),
    { refetchInterval: 10000 } // Refresh every 10 seconds
  );

  const { data: recentLogs, isLoading: logsLoading } = useQuery(
    'recentLogs',
    () => Promise.resolve([
      { id: '1', type: 'Supplement', description: 'Took Omega-3 Fish Oil', timestamp: new Date().toISOString(), points: 10 },
      { id: '2', type: 'Mood', description: 'Logged daily mood metrics', timestamp: new Date().toISOString(), points: 5 },
    ]),
    { refetchInterval: 30000 }
  );

  const { data: weeklyData } = useQuery(
    'weeklyProgress',
    () => Promise.resolve({
      dailyStats: [
        { name: 'Mon', ecsScore: 65, supplementsCompleted: 8, mood: 7 },
        { name: 'Tue', ecsScore: 72, supplementsCompleted: 9, mood: 8 },
        { name: 'Wed', ecsScore: 68, supplementsCompleted: 7, mood: 6 },
        { name: 'Thu', ecsScore: 78, supplementsCompleted: 10, mood: 8 },
        { name: 'Fri', ecsScore: 82, supplementsCompleted: 10, mood: 9 },
        { name: 'Sat', ecsScore: 85, supplementsCompleted: 9, mood: 8 },
        { name: 'Sun', ecsScore: 88, supplementsCompleted: 10, mood: 9 },
      ]
    }),
    { refetchInterval: 300000 } // Refresh every 5 minutes
  );

  if (statsLoading || progressLoading || logsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Current Streak',
      value: userStats?.currentStreak || 0,
      change: 'days',
      changeType: 'neutral' as const,
      icon: Flame,
      color: 'text-orange-600',
    },
    {
      name: 'ECS Impact Score',
      value: `${userStats?.ecsScore || 0}%`,
      change: '+5% this week',
      changeType: 'positive' as const,
      icon: Target,
      color: 'text-green-600',
    },
    {
      name: 'Total Points',
      value: userStats?.totalPoints || 0,
      change: '+120 this week',
      changeType: 'positive' as const,
      icon: Trophy,
      color: 'text-blue-600',
    },
    {
      name: 'Supplements Taken',
      value: `${todaysProgress?.supplementsTaken || 0}/10`,
      change: 'today',
      changeType: 'neutral' as const,
      icon: Pill,
      color: 'text-purple-600',
    },
  ];

  // Mock data for charts - replace with real analytics data
  const chartData = weeklyData?.dailyStats || [
    { name: 'Mon', ecsScore: 65, supplementsCompleted: 8, mood: 7 },
    { name: 'Tue', ecsScore: 72, supplementsCompleted: 9, mood: 8 },
    { name: 'Wed', ecsScore: 68, supplementsCompleted: 7, mood: 6 },
    { name: 'Thu', ecsScore: 78, supplementsCompleted: 10, mood: 8 },
    { name: 'Fri', ecsScore: 82, supplementsCompleted: 10, mood: 9 },
    { name: 'Sat', ecsScore: 85, supplementsCompleted: 9, mood: 8 },
    { name: 'Sun', ecsScore: 88, supplementsCompleted: 10, mood: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-gray-600">Here's your ECS support journey today</p>
        </div>
        
        {/* Current Plan Indicator */}
        <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
          <Heart className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            {userStats?.currentPlan || 'CannaBalance Core'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 
                    stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ECS Score Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ECS Impact Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ecsScore" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Daily Completion */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Supplement Completion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="supplementsCompleted" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity and Today's Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Plan */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Today's Plan</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {todaysProgress?.plan?.map((item: any, index: number) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 w-4 h-4 rounded-full border-2 ${
                    item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                  }`}>
                    {item.completed && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                      {item.name} - {item.timing}
                    </p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              )) || (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No plan selected yet</p>
                  <button className="mt-2 text-green-600 text-sm font-medium hover:text-green-500">
                    Choose your ECS stack →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Logs */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Check-ins</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentLogs?.map((log: any, index: number) => (
                <div key={log.id || index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{log.type}: {log.description}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(log.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-gray-500 ml-1">+{log.points}pts</span>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No check-ins yet today</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;