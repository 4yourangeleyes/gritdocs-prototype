import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: '🏠', paths: ['/'] },
    { name: 'Chat', href: '/chat', icon: '💬', paths: ['/chat'] },
    { name: 'Canvas', href: '/canvas', icon: '📋', paths: ['/canvas'] },
    { name: 'Clients', href: '/clients', icon: '�', paths: ['/clients'] },
    { name: 'Settings', href: '/settings', icon: '⚙️', paths: ['/settings'] },
  ];

  const isActivePath = (paths: string[]) => {
    return paths.some(path => 
      path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
    );
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-40 safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">GritDocs</h1>
              {profile && (
                <p className="text-xs text-gray-500 truncate max-w-32">
                  {profile.full_name}
                </p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-64 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col h-full">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GritDocs</span>
            </div>
          </div>

          <nav className="flex-1 px-6 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActivePath(item.paths)
                    ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-600'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-200">
            {profile && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-500">{profile.email}</p>
                {profile.company_name && (
                  <p className="text-xs text-gray-500">{profile.company_name}</p>
                )}
              </div>
            )}
            <button
              onClick={logout}
              className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span>🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileMenu(false)}
          />
          
          <div className="relative bg-white w-80 max-w-xs shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
                <span className="text-lg font-bold text-gray-900">Menu</span>
                <button
                  onClick={() => setShowMobileMenu(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="flex-1 px-6 py-6 space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActivePath(item.paths)
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-6 border-t border-gray-200">
                {profile && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                    <p className="text-xs text-gray-500">{profile.email}</p>
                    {profile.company_name && (
                      <p className="text-xs text-gray-500">{profile.company_name}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <span>🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`${user ? 'lg:ml-64' : ''}`}>
        <div className={`${user ? 'pt-16 lg:pt-0' : ''} pb-safe`}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden nav-mobile">
        <div className="flex justify-around items-center">
          {navigation.slice(0, 4).map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center py-2 px-1 min-w-0 transition-colors ${
                isActivePath(item.paths)
                  ? 'text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-lg mb-1">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}