import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { KeyRotationService, KeyRotationProgress as KeyRotationProgressType } from '@/services/KeyRotationService';
import { KeyRotationProgress } from '@components/KeyRotationProgress';

export function KeyRotationScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rotationProgress, setRotationProgress] = useState<KeyRotationProgressType | null>(null);

  useEffect(() => {
    const checkAndPollProgress = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Check rotation progress
      const progress = await KeyRotationService.getRotationProgress(user.uid);
      setRotationProgress(progress);

      if (progress.isComplete) {
        // Rotation complete - redirect to dashboard
        navigate('/dashboard');
        return;
      }

      // Poll for updates every 3 seconds
      const interval = setInterval(async () => {
        const updatedProgress = await KeyRotationService.getRotationProgress(user.uid);
        setRotationProgress(updatedProgress);

        if (updatedProgress.isComplete) {
          clearInterval(interval);
          // Redirect to dashboard after completion
          navigate('/dashboard');
        }
      }, 3000);

      return () => clearInterval(interval);
    };

    checkAndPollProgress();
  }, [user, navigate]);

  if (!rotationProgress) {
    return (
      <div className='page flex items-center justify-center'>
        <div>Checking rotation status...</div>
      </div>
    );
  }

  return (
    <div className='page flex items-center justify-center'>
      <div className='w-full max-w-2xl px-4'>
        <KeyRotationProgress
          totalItems={rotationProgress.totalItems}
          processedItems={rotationProgress.processedItems}
          percentComplete={rotationProgress.percentComplete}
        />
      </div>
    </div>
  );
}

export default KeyRotationScreen;
