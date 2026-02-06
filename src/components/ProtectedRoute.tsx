import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { UserSettingsService } from '@/services/UserSettingsService';
import Loading from '@ui/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requireMasterKey?: boolean;
}

export function ProtectedRoute({ children, requireMasterKey = false }: ProtectedRouteProps) {
  const { user, loading, masterKey } = useAuth();
  const [checkingRecoveryCodes, setCheckingRecoveryCodes] = useState(false);
  const [hasRecoveryCodes, setHasRecoveryCodes] = useState<boolean | null>(null);

  // Check for recovery codes when master key is required
  useEffect(() => {
    const checkRecoveryCodes = async () => {
      if (requireMasterKey && user && masterKey && hasRecoveryCodes === null) {
        setCheckingRecoveryCodes(true);
        try {
          const codes = await UserSettingsService.getRecoveryCodes(user.uid);
          setHasRecoveryCodes(codes.length > 0);
        } catch (error) {
          console.error('Error checking recovery codes:', error);
          setHasRecoveryCodes(false);
        } finally {
          setCheckingRecoveryCodes(false);
        }
      }
    };

    checkRecoveryCodes();
  }, [requireMasterKey, user, masterKey, hasRecoveryCodes]);

  // Show loading while checking authentication state or recovery codes
  if (loading || checkingRecoveryCodes) {
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

  // If master key is present but no recovery codes, redirect to generate them
  if (requireMasterKey && masterKey && hasRecoveryCodes === false) {
    return <Navigate to="/auth/recovery-codes" replace />;
  }

  return <>{children}</>;
}
