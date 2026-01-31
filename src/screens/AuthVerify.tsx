import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { CalypsoLogo } from '@components/Logo';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from '@lib/firebase/FirebaseConfig';
import { FirebaseError } from 'firebase/app';
import {
  isTabActive,
  notifyAuthVerified,
  closeCurrentTab,
} from '@utils/tabCommunication';

export function AuthVerify() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const { signInWithEmailLink } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const verifyEmail = useCallback(
    async (email: string) => {
      setLoading(true);
      try {
        await signInWithEmailLink(email);

        // Wait a moment for auth state to update
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const redirectPath = '/auth/passphrase';
        
        // Extract the tab ID from the URL (if present)
        const targetTabId = searchParams.get('tabId');

        if (targetTabId) {
          // Check if the original tab is still active
          const tabStillActive = await isTabActive(targetTabId);
          
          if (tabStillActive) {
            // Original tab is still open - redirect it and close this tab
            notifyAuthVerified(targetTabId, redirectPath);

            // Wait a moment for the message to be sent
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Attempt to close this tab
            closeCurrentTab();

            // Wait a bit to give the browser a chance to close the tab
            // If the tab doesn't close, navigate anyway as a fallback
            await new Promise((resolve) => setTimeout(resolve, 1500));
            navigate(redirectPath);
          } else {
            // Original tab is gone - continue in this tab
            navigate(redirectPath);
          }
        } else {
          // No tab ID provided (shouldn't happen with new flow, but handle gracefully)
          // Just navigate in the current tab
          navigate(redirectPath);
        }
      } catch (error: unknown) {
        const firebaseError = error as FirebaseError;
        console.error('Error verifying email:', firebaseError);

        // Check if error is due to expired/invalid link
        const errorCode = firebaseError?.code || '';
        if (
          errorCode === 'auth/invalid-action-code' ||
          errorCode === 'auth/expired-action-code'
        ) {
          setError(
            'This link has expired or already been used. Please request a new sign-in link.',
          );
        } else {
          setError(
            'Failed to verify email. The link may be invalid or expired.',
          );
        }
        setLoading(false);
      }
    },
    [signInWithEmailLink, navigate, searchParams],
  );

  useEffect(() => {
    const checkEmail = async () => {
      // First, verify this is actually a valid email link
      const currentUrl = window.location.href;
      if (!isSignInWithEmailLink(auth, currentUrl)) {
        setError(
          'This link is invalid or has expired. Please request a new sign-in link.',
        );
        setLoading(false);
        return;
      }

      const storedEmail = window.localStorage.getItem('emailForSignIn');

      if (!storedEmail) {
        // Only show modal if we don't have stored email
        // This prevents the flash when email is already in localStorage
        setLoading(false);
        setShowEmailModal(true);
      } else {
        // Proceed with stored email immediately (no modal flash)
        await verifyEmail(storedEmail);
      }
    };

    checkEmail();
  }, [verifyEmail]);

  const handleEmailSubmit = async () => {
    if (!emailInput.trim()) {
      return;
    }

    setShowEmailModal(false);
    await verifyEmail(emailInput);
  };

  return (
    <div className='page flex items-center justify-center'>
      <div className='w-full max-w-md space-y-8 px-4 text-center'>
        {loading ? (
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <CalypsoLogo size={80} />
            </div>
            <div className='space-y-2'>
              <h1 className='font-mono text-3xl font-bold tracking-wider'>
                VERIFYING...
              </h1>
              <p className='text-foreground/70 font-mono text-sm'>
                PLEASE WAIT WHILE WE VERIFY YOUR EMAIL
              </p>
            </div>
          </div>
        ) : error ? (
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <CalypsoLogo size={80} />
            </div>
            <div className='space-y-4'>
              <h1 className='text-destructive font-mono text-2xl font-bold tracking-wider'>
                VERIFICATION FAILED
              </h1>
              <p className='text-foreground/70 font-mono text-sm'>{error}</p>
              <div className='space-y-2'>
                <Button
                  href='/login'
                  className='w-full font-mono tracking-wider'
                >
                  REQUEST NEW LINK
                </Button>
                <p className='text-foreground/50 font-mono text-xs'>
                  Check your email for the most recent sign-in link, or request
                  a new one above.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Email Confirmation Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          navigate('/login');
        }}
        title='Confirm Your Email'
      >
        <div className='space-y-4'>
          <p className='text-foreground/70 font-mono text-sm'>
            Please enter your email address to complete verification
          </p>
          <div className='space-y-2'>
            <label className='font-mono text-xs tracking-wider uppercase'>
              Email Address
            </label>
            <Input
              type='email'
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder='your@email.com'
              className='font-mono'
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEmailSubmit();
                }
              }}
            />
          </div>
          <div className='flex gap-2'>
            <Button
              variant='secondary'
              onClick={() => {
                setShowEmailModal(false);
                navigate('/login');
              }}
              className='flex-1 font-mono tracking-wider'
            >
              CANCEL
            </Button>
            <Button
              variant='primary'
              onClick={handleEmailSubmit}
              disabled={!emailInput.trim()}
              className='flex-1 font-mono tracking-wider'
            >
              VERIFY
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AuthVerify;
