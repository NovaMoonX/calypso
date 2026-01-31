import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import Loading from '@ui/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requireMasterKey?: boolean;
}

export function ProtectedRoute({ children, requireMasterKey = false }: ProtectedRouteProps) {
  const { user, loading, masterKey } = useAuth();

  // Show loading while checking authentication state
  if (loading) {
    return <Loading />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If master key is required but not present, redirect to passphrase setup
  if (requireMasterKey && !masterKey) {
    return <Navigate to="/auth/passphrase" replace />;
  }

  return <>{children}</>;
}
