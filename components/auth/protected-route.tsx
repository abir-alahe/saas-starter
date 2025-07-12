'use client';

import { useRequireAuth } from '@/lib/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const user = useRequireAuth();

  if (!user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for checking lifetime access
export function useRequireLifetimeAccess() {
  const { hasLifetimeAccess, isAuthenticated } = useRequireAuth();
  
  if (!isAuthenticated) {
    return null;
  }
  
  if (!hasLifetimeAccess) {
    // Redirect to pricing if user doesn't have lifetime access
    window.location.href = '/pricing';
    return null;
  }
  
  return true;
} 