import React, { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Heart, 
  ShoppingCart, 
  CheckCircle, 
  Calendar, 
  Trophy, 
  User,
  LogOut,
  Menu,
  X,
  Leaf
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import clsx from 'clsx';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'ECS Stacks', href: '/stacks', icon: Heart },
    { name: 'Shop', href: '/shop', icon: ShoppingCart },
    { name: 'Daily Check-In', href: '/checkin', icon: CheckCircle },
    { name: 'T-Break Tracker', href: '/tbreak', icon: Calendar },
    { name: 'Rewards', href: '/rewards', icon: Trophy },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="flex h-screen bg-green-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 bg-green-600">
          <div className="flex items-center space-x-2">
            <Leaf className="w-7 h-7 text-white" />
            <h1 className="text-xl font-bold text-white">CannaBalance</h1>
          </div>
          <button
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5 transition-colors',
                      isActive
                        ? 'text-green-600'
                        : 'text-gray-400 group-hover:text-gray-600'
                    )}
                  />
                  {item.name}
                </NavLink>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="px-3 py-2 mb-4 bg-green-50 rounded-lg">
              <p className="text-xs text-green-600 font-medium">ECS Focus</p>
              <p className="text-sm text-gray-600 mt-1">Supporting your Endocannabinoid System daily</p>
            </div>
            
            <button
              onClick={logout}
              className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-600" />
              Sign out
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center space-x-2">
              <Leaf className="w-6 h-6 text-green-600" />
              <h1 className="text-lg font-semibold text-gray-900">CannaBalance</h1>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;