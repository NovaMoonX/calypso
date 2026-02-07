import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { UserSettingsService } from '@/services/UserSettingsService';
import { KeyRotationService } from '@/services/KeyRotationService';
import Loading from '@ui/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
  requireMasterKey?: boolean;
}

export function ProtectedRoute({ children, requireMasterKey = false }: ProtectedRouteProps) {
  const { user, loading, masterKey } = useAuth();
  const [checkingRecoveryCodes, setCheckingRecoveryCodes] = useState(false);
  const [hasRecoveryCodes, setHasRecoveryCodes] = useState<boolean | null>(null);
  const [checkingRotation, setCheckingRotation] = useState(false);
  const [rotationInProgress, setRotationInProgress] = useState<boolean | null>(null);

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

  // Check for key rotation in progress when master key is required
  useEffect(() => {
    const checkRotation = async () => {
      if (requireMasterKey && user && masterKey && rotationInProgress === null) {
        setCheckingRotation(true);
        try {
          const inProgress = await KeyRotationService.isRotationInProgress(user.uid);
          setRotationInProgress(inProgress);
        } catch (error) {
          console.error('Error checking rotation status:', error);
          setRotationInProgress(false);
        } finally {
          setCheckingRotation(false);
        }
      }
    };

    checkRotation();
  }, [requireMasterKey, user, masterKey, rotationInProgress]);

  // Show loading while checking authentication state, recovery codes, or rotation
  if (loading || checkingRecoveryCodes || checkingRotation) {
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

  // If rotation is in progress, redirect to rotation screen
  if (requireMasterKey && masterKey && rotationInProgress === true) {
    return <Navigate to="/auth/key-rotation" replace />;
  }

  return <>{children}</>;
}
