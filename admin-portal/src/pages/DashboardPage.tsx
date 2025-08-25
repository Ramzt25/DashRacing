import React from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Car, 
  Trophy, 
  Calendar,
  AlertTriangle,
  Activity,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from 'date-fns';

const DashboardPage: React.FC = () => {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    () => apiService.getDashboardStats(),
    { refetchInterval: 30000 } // Refresh every 30 seconds
  );

  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    'recentActivity',
    () => apiService.getRecentActivity(10),
    { refetchInterval: 10000 } // Refresh every 10 seconds
  );

  const { data: systemHealth, isLoading: healthLoading } = useQuery(
    'systemHealth',
    () => apiService.getSystemHealth(),
    { refetchInterval: 5000 } // Refresh every 5 seconds
  );

  const { data: analytics } = useQuery(
    'analytics',
    () => apiService.getAnalytics('7d'),
    { refetchInterval: 300000 } // Refresh every 5 minutes
  );

  if (statsLoading || activityLoading || healthLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = [
    {
      name: 'Total Users',
      value: dashboardStats?.totalUsers || 0,
      change: '+12%',
      changeType: 'positive',
      icon: Users,
    },
    {
      name: 'Active Races',
      value: dashboardStats?.activeRaces || 0,
      change: '+5',
      changeType: 'positive',
      icon: Trophy,
    },
    {
      name: 'Total Cars',
      value: dashboardStats?.totalCars || 0,
      change: '+23%',
      changeType: 'positive',
      icon: Car,
    },
    {
      name: 'Upcoming Events',
      value: dashboardStats?.totalEvents || 0,
      change: '+2',
      changeType: 'positive',
      icon: Calendar,
    },
  ];

  // Mock data for charts - replace with real analytics data
  const chartData = analytics?.dailyStats || [
    { name: 'Mon', users: 65, races: 12, events: 3 },
    { name: 'Tue', users: 59, races: 18, events: 4 },
    { name: 'Wed', users: 80, races: 15, events: 2 },
    { name: 'Thu', users: 81, races: 22, events: 5 },
    { name: 'Fri', users: 56, races: 25, events: 7 },
    { name: 'Sat', users: 95, races: 35, events: 8 },
    { name: 'Sun', users: 88, races: 28, events: 6 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Overview of your DashRacing platform</p>
        </div>
        
        {/* System Health Indicator */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            systemHealth?.status === 'healthy' ? 'bg-green-500' : 
            systemHealth?.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            System {systemHealth?.status || 'Unknown'}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <p className={`ml-2 text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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
        {/* Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="races" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Events Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Events Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="events" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivity?.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Status</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className={`text-sm font-medium ${
                  systemHealth?.database.status === 'connected' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemHealth?.database.status || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className="text-sm font-medium text-gray-900">
                  {systemHealth?.memory.percentage.toFixed(1) || '0'}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU Usage</span>
                <span className="text-sm font-medium text-gray-900">
                  {systemHealth?.cpu.usage.toFixed(1) || '0'}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-gray-900">
                  {systemHealth?.uptime ? Math.floor(systemHealth.uptime / 3600) : '0'}h
                </span>
              </div>

              {systemHealth?.status !== 'healthy' && (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">System requires attention</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;