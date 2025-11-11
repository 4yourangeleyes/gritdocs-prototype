import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function HomePage() {
  const { user, profile } = useAuth();

  const mainActions = [
    {
      type: 'chat',
      title: 'AI Assistant',
      description: 'Create docs with AI help',
      icon: '🤖',
      path: '/chat',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
      textColor: 'text-blue-700',
    },
    {
      type: 'canvas',
      title: 'Canvas',
      description: 'Design documents visually',
      icon: '🎨',
      path: '/canvas',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
      textColor: 'text-purple-700',
    },
    {
      type: 'clients',
      title: 'Clients',
      description: 'Manage your contacts',
      icon: '👥',
      path: '/clients',
      color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
      textColor: 'text-green-700',
    },
  ];

  return (
    <div className="screen-dashboard">
      <div className="container-lg py-6 px-4">
        {/* Prototype Mode Banner */}
        {process.env.REACT_APP_PROTOTYPE_MODE === 'true' && (
          <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🚀</span>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Prototype Mode Active</h3>
                <p className="text-sm text-orange-700">
                  Test all features with intelligent templates. Full AI generation available in production.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="heading-lg mb-2">
            {profile?.full_name ? `Welcome back, ${profile.full_name.split(' ')[0]}!` : 'Welcome to GritDocs!'}
          </h1>
          <p className="body-base text-gray-600">
            What would you like to create today?
          </p>
        </div>

        {/* Main Action Cards */}
        <div className="grid gap-4 sm:gap-6 mb-8">
          {mainActions.map((action) => (
            <Link
              key={action.type}
              to={action.path}
              className={`card-interactive ${action.color} border-2 scale-on-press-sm`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-3xl sm:text-4xl">{action.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className={`heading-sm mb-1 ${action.textColor}`}>
                    {action.title}
                  </h3>
                  <p className="body-small text-gray-600">
                    {action.description}
                  </p>
                </div>
                <svg 
                  className="w-6 h-6 text-gray-400 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <Link
            to="/chat"
            className="card text-center py-4 px-3 hover:bg-orange-50 transition-colors"
          >
            <div className="text-2xl mb-2">📄</div>
            <div className="text-sm font-medium text-gray-700">Invoice</div>
          </Link>
          <Link
            to="/chat"
            className="card text-center py-4 px-3 hover:bg-orange-50 transition-colors"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="text-sm font-medium text-gray-700">Contract</div>
          </Link>
          <Link
            to="/chat"
            className="card text-center py-4 px-3 hover:bg-orange-50 transition-colors"
          >
            <div className="text-2xl mb-2">📝</div>
            <div className="text-sm font-medium text-gray-700">Quote</div>
          </Link>
          <Link
            to="/chat"
            className="card text-center py-4 px-3 hover:bg-orange-50 transition-colors"
          >
            <div className="text-2xl mb-2">💼</div>
            <div className="text-sm font-medium text-gray-700">HR Doc</div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="heading-md mb-4">Recent Documents</h2>
          <div className="card">
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📂</div>
              <p className="body-base text-gray-500 mb-4">No documents yet</p>
              <Link to="/chat" className="btn-primary">
                Create Your First Document
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {user && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">0</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">0</div>
              <div className="text-sm text-gray-600">Clients</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">$0</div>
              <div className="text-sm text-gray-600">Invoiced</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">0</div>
              <div className="text-sm text-gray-600">Templates</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}