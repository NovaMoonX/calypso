import { EMAIL_FOR_SIGN_IN_KEY } from '@/contexts/AuthProvider';
import { CalypsoLogo } from '@components/Logo';
import { useAuth } from '@hooks/useAuth';
import { auth } from '@lib/firebase/FirebaseConfig';
import { Button, Input, Modal } from '@moondreamsdev/dreamer-ui/components';
import {
  closeCurrentTab,
  isTabActive,
  notifyAuthVerified,
  TAB_ID_PARAM,
} from '@utils/tabCommunication';
import { FirebaseError } from 'firebase/app';
import { isSignInWithEmailLink } from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Timing constants for tab closing behavior
const AUTO_CLOSE_COUNTDOWN_SECONDS = 10;
const REDIRECT_COUNTDOWN_SECONDS = 5;

export function AuthVerify() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [closeCountdown, setCloseCountdown] = useState<number | undefined>();
  const [redirectCountdown, setRedirectCountdown] = useState<
    number | undefined
  >();
  const { signInWithEmailLink } = useAuth();
  const targetTabIdRef = useRef<string | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const targetTabId = searchParams.get(TAB_ID_PARAM);

  const handleCountdown = useCallback(
    (
      setter: React.Dispatch<React.SetStateAction<number | undefined>>,
      countdown: number,
      onComplete: () => void,
    ) => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }

      let timeLeft = countdown;
      setter(timeLeft);

      const intervalId = setInterval(() => {
        timeLeft -= 1;
        const nextValue = Math.max(timeLeft, 0);
        setter(nextValue);

        if (nextValue <= 0) {
          clearInterval(intervalId);
          countdownIntervalRef.current = null;
          onComplete();
        }
      }, 1000);

      countdownIntervalRef.current = intervalId;
    },
    [],
  );

  const verifyEmail = useCallback(
    async (email: string) => {
      setLoading(true);
      try {
        await signInWithEmailLink(email);

        // Wait a moment for auth state to update
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const redirectPath = '/auth/passphrase';

        const targetTabIdValue = targetTabIdRef.current;
        if (targetTabIdValue) {
          // Check if the original tab is still active
          const tabStillActive = await isTabActive(targetTabIdValue);

          if (tabStillActive) {
            // Notify the original tab immediately
            notifyAuthVerified(targetTabIdValue, redirectPath);

            setLoading(false);
            handleCountdown(
              setCloseCountdown,
              AUTO_CLOSE_COUNTDOWN_SECONDS,
              () => {
                // Attempt to close this tab
                closeCurrentTab();

                // Don't navigate as fallback - keep showing the countdown screen
                // The user has been instructed to return to the original tab
                // If the browser prevents tab closing, they can manually close it
              },
            );
          } else {
            setLoading(false);
            handleCountdown(
              setRedirectCountdown,
              REDIRECT_COUNTDOWN_SECONDS,
              () => {
                // Original tab is gone - continue in this tab
                navigate(redirectPath);
              },
            );
          }
        } else {
          // No tab ID provided (shouldn't happen with new flow, but handle gracefully)
          // Just navigate in the current ta
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
    [signInWithEmailLink, navigate, handleCountdown],
  );

  useEffect(() => {
    targetTabIdRef.current = targetTabId;
  }, [targetTabId]);

  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    };
  }, []);

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

      const storedEmail = window.localStorage.getItem(EMAIL_FOR_SIGN_IN_KEY);

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
        ) : closeCountdown !== undefined ? (
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <CalypsoLogo size={80} />
            </div>
            <div className='space-y-4'>
              <h1 className='text-primary font-mono text-3xl font-bold tracking-wider'>
                VERIFIED!
              </h1>
              <div className='border-border bg-card space-y-4 rounded-lg border p-6'>
                <p className='text-foreground font-mono text-lg'>
                  Your email has been verified successfully.
                </p>
                <p className='text-foreground/70 font-mono text-sm'>
                  Please return to your original tab to continue.
                </p>
                {closeCountdown > 0 ? (
                  <>
                    <div className='flex items-center justify-center gap-3 py-4'>
                      <div className='text-primary font-mono text-6xl font-bold'>
                        {closeCountdown}
                      </div>
                    </div>
                    <p className='text-foreground/50 font-mono text-xs'>
                      This tab will close automatically in {closeCountdown}{' '}
                      second
                      {closeCountdown !== 1 ? 's' : ''}
                    </p>
                  </>
                ) : (
                  <div className='py-4'>
                    <p className='text-foreground/70 font-mono text-sm'>
                      You can now close this tab manually.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : redirectCountdown !== undefined ? (
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <CalypsoLogo size={80} />
            </div>
            <div className='space-y-4'>
              <h1 className='text-primary font-mono text-3xl font-bold tracking-wider'>
                VERIFIED!
              </h1>
              <div className='border-border bg-card space-y-4 rounded-lg border p-6'>
                <p className='text-foreground font-mono text-lg'>
                  Your email has been verified successfully.
                </p>
                <p className='text-foreground/70 font-mono text-sm'>
                  Redirecting you in {redirectCountdown} second
                  {redirectCountdown !== 1 ? 's' : ''}
                </p>
              </div>
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
        ) : (
          <div className='space-y-6'>
            <div className='flex justify-center'>
              <CalypsoLogo size={80} />
            </div>
            <div className='space-y-4'>
              <h1 className='text-destructive font-mono text-2xl font-bold tracking-wider'>
                SOMETHING WENT WRONG
              </h1>
              <p className='text-foreground/70 font-mono text-sm'>
                Head back to the login page and try again.
              </p>
              <div className='space-y-2'>
                <Button
                  href='/login'
                  className='w-full font-mono tracking-wider'
                >
                  RETURN TO LOGIN
                </Button>
              </div>
            </div>
          </div>
        )}
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
