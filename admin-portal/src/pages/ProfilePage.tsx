import React, { useState } from 'react';
import { 
  User,
  Settings,
  Bell,
  Shield,
  CreditCard,
  Calendar,
  Target,
  Award,
  Edit3,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Heart
} from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  dateJoined: string;
  currentPlan: 'Core' | 'Premium' | 'Elite';
  subscriptionStatus: 'active' | 'paused' | 'cancelled';
  nextBilling: string;
  ecsGoals: {
    primaryGoal: string;
    targetScore: number;
    currentScore: number;
  };
  preferences: {
    notifications: {
      supplement_reminders: boolean;
      progress_updates: boolean;
      tbreak_support: boolean;
      community_updates: boolean;
    };
    privacy: {
      share_progress: boolean;
      public_profile: boolean;
    };
  };
  stats: {
    totalCheckIns: number;
    longestStreak: number;
    averageEcsScore: number;
    completedTBreaks: number;
  };
}

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'preferences' | 'stats'>('profile');
  
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user-123',
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    dateJoined: '2024-01-01',
    currentPlan: 'Premium',
    subscriptionStatus: 'active',
    nextBilling: '2024-02-01',
    ecsGoals: {
      primaryGoal: 'Improve sleep quality and reduce anxiety',
      targetScore: 85,
      currentScore: 78
    },
    preferences: {
      notifications: {
        supplement_reminders: true,
        progress_updates: true,
        tbreak_support: true,
        community_updates: false
      },
      privacy: {
        share_progress: true,
        public_profile: false
      }
    },
    stats: {
      totalCheckIns: 45,
      longestStreak: 12,
      averageEcsScore: 76,
      completedTBreaks: 1
    }
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
    // API call would happen here
    console.log('Profile updated:', editedProfile);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const updatePreference = (section: keyof UserProfile['preferences'], key: string, value: boolean) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...prev.preferences[section],
          [key]: value
        }
      }
    }));
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Core': return 'text-green-600 bg-green-100';
      case 'Premium': return 'text-blue-600 bg-blue-100';
      case 'Elite': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and ECS optimization preferences</p>
        </div>
        
        {activeTab === 'profile' && (
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'profile', name: 'Profile', icon: User },
            { id: 'subscription', name: 'Subscription', icon: CreditCard },
            { id: 'preferences', name: 'Preferences', icon: Settings },
            { id: 'stats', name: 'Statistics', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
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

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profile.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profile.email}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profile.phone || 'Not provided'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="City, State"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-900">{profile.location || 'Not provided'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ECS Goals */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">ECS Optimization Goals</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Goal</label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.ecsGoals.primaryGoal}
                      onChange={(e) => setEditedProfile(prev => ({
                        ...prev,
                        ecsGoals: { ...prev.ecsGoals, primaryGoal: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      rows={3}
                      placeholder="What do you hope to achieve with ECS support?"
                    />
                  ) : (
                    <div className="flex items-start space-x-2">
                      <Target className="h-4 w-4 text-gray-400 mt-1" />
                      <span className="text-gray-900">{profile.ecsGoals.primaryGoal}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target ECS Score</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editedProfile.ecsGoals.targetScore}
                        onChange={(e) => setEditedProfile(prev => ({
                          ...prev,
                          ecsGoals: { ...prev.ecsGoals, targetScore: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-green-600">{profile.ecsGoals.targetScore}</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Score</label>
                    <span className="text-2xl font-bold text-blue-600">{profile.ecsGoals.currentScore}</span>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(profile.ecsGoals.currentScore / profile.ecsGoals.targetScore) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Tab */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          {/* Current Plan */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Current Subscription</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Current Plan</h4>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(profile.currentPlan)}`}>
                    CannaBalance {profile.currentPlan}
                  </span>
                </div>

                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Status</h4>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile.subscriptionStatus)}`}>
                    {profile.subscriptionStatus.charAt(0).toUpperCase() + profile.subscriptionStatus.slice(1)}
                  </span>
                </div>

                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-600 mb-2">Next Billing</h4>
                  <div className="flex items-center justify-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900">{new Date(profile.nextBilling).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                  Upgrade Plan
                </button>
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                  Manage Billing
                </button>
                <button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg hover:bg-red-50">
                  Cancel Subscription
                </button>
              </div>
            </div>
          </div>

          {/* Plan Comparison */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Available Plans</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Core', 'Premium', 'Elite'].map(plan => (
                  <div 
                    key={plan}
                    className={`border-2 rounded-lg p-4 ${
                      profile.currentPlan === plan ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">CannaBalance {plan}</h4>
                    <p className="text-2xl font-bold text-gray-900 mb-4">
                      ${plan === 'Core' ? '69' : plan === 'Premium' ? '109' : '149'}
                      <span className="text-sm font-normal text-gray-600">/month</span>
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• {plan === 'Core' ? '4' : plan === 'Premium' ? '7' : '10'} supplements</li>
                      <li>• ECS Impact Score tracking</li>
                      <li>• Daily check-in system</li>
                      {plan !== 'Core' && <li>• Advanced absorption support</li>}
                      {plan === 'Elite' && <li>• Complete detox & sleep formula</li>}
                    </ul>
                    {profile.currentPlan === plan ? (
                      <button className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-lg">
                        Current Plan
                      </button>
                    ) : (
                      <button className="w-full mt-4 border border-green-600 text-green-600 py-2 px-4 rounded-lg hover:bg-green-50">
                        {plan === 'Core' ? 'Downgrade' : 'Upgrade'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(editedProfile.preferences.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {key === 'supplement_reminders' && 'Get reminded to take your daily supplements'}
                      {key === 'progress_updates' && 'Weekly summaries of your ECS progress'}
                      {key === 'tbreak_support' && 'Encouragement and tips during tolerance breaks'}
                      {key === 'community_updates' && 'Updates from the CannaBalance community'}
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreference('notifications', key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {Object.entries(editedProfile.preferences.privacy).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {key === 'share_progress' && 'Allow sharing progress with community members'}
                      {key === 'public_profile' && 'Make your profile visible to other users'}
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreference('privacy', key, !value)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Total Check-ins</h3>
              <p className="text-2xl font-bold text-blue-600">{profile.stats.totalCheckIns}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Heart className="h-8 w-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Longest Streak</h3>
              <p className="text-2xl font-bold text-red-600">{profile.stats.longestStreak} days</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Target className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">Avg ECS Score</h3>
              <p className="text-2xl font-bold text-green-600">{profile.stats.averageEcsScore}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Award className="h-8 w-8 text-purple-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">T-Breaks Completed</h3>
              <p className="text-2xl font-bold text-purple-600">{profile.stats.completedTBreaks}</p>
            </div>
          </div>

          {/* Achievement Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Journey Summary</h3>
            </div>
            <div className="p-6">
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-4">
                  You joined CannaBalance on {new Date(profile.dateJoined).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  Since then, you've been on an amazing journey to optimize your ECS. Keep up the great work!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;