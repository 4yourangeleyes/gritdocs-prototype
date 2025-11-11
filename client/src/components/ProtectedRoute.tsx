import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();

  console.log('🛡️ ProtectedRoute: isLoading =', isLoading, ', isAuthenticated =', isAuthenticated);

  if (isLoading) {
    console.log('⏳ ProtectedRoute: Showing loading screen');
    return (
      <div className="min-h-screen flex items-center justify-center bg-grit-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-grit-orange border-t-transparent mx-auto mb-4"></div>
          <p className="text-grit-light font-bold">LOADING GRITDOCS...</p>
          <p className="text-grit-light text-sm mt-2">Debug: isLoading={String(isLoading)}, isAuthenticated={String(isAuthenticated)}</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ ProtectedRoute: Authenticated, rendering children');
  return <>{children}</>;
}