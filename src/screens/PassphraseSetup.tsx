import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useAuth } from '@hooks/useAuth';
import { UserSettingsService } from '@/services/UserSettingsService';

export function PassphraseSetup() {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [isVerifyingUser, setIsVerifyingUser] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const { user, setMasterKeyFromPassphrase } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a stored salt in Firestore (returning user)
    const checkUserStatus = async () => {
      if (user) {
        const hasPassphrase = await UserSettingsService.hasPassphrase(user.uid);
        setIsReturningUser(hasPassphrase);
      }
      setIsVerifyingUser(false);
    };

    checkUserStatus();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isReturningUser && passphrase !== confirmPassphrase) {
      addToast({
        title: 'Error',
        description: 'Passphrases do not match',
        type: 'error',
      });
      return;
    }

    if (passphrase.length < 12) {
      addToast({
        title: 'Error',
        description: 'Passphrase must be at least 12 characters long',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get stored salt from Firestore if returning user
      let salt: Uint8Array | undefined;
      if (user && isReturningUser) {
        salt = (await UserSettingsService.getSalt(user.uid)) || undefined;
      }

      // Set master key from passphrase
      // Pass isNewPassphrase flag to store salt in Firestore for new users
      await setMasterKeyFromPassphrase(passphrase, salt, !isReturningUser);

      // Redirect to recovery codes for new users, dashboard for returning users
      if (isReturningUser) {
        navigate('/dashboard');
      } else {
        navigate('/auth/recovery-codes');
      }
    } catch (error) {
      console.error('Error setting master key:', error);
      addToast({
        title: 'Error',
        description: isReturningUser
          ? 'Incorrect passphrase. Please try again.'
          : 'Failed to set up encryption. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isVerifyingUser) {
    return (
      <div className='page flex items-center justify-center'>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className='page flex items-center justify-center'>
      <div className='w-full max-w-md space-y-8 px-4'>
        <div className='space-y-4 text-center'>
          <h1 className='text-4xl font-bold'>
            {isReturningUser ? 'Welcome Back' : 'Set Up Encryption'}
          </h1>
          <p className='text-foreground/70'>
            {isReturningUser
              ? 'Enter your passphrase to unlock your vault'
              : 'Create a strong passphrase to encrypt your data'}
          </p>
          <div className='border-warning/20 bg-warning/10 rounded-lg border p-4 text-left text-sm'>
            <strong className='mb-2 block'>⚠️ Important:</strong>
            <ul className='list-inside list-disc space-y-1'>
              <li>Your passphrase is never stored or transmitted</li>
              <li>Without it, your data cannot be decrypted</li>
              <li>Make sure to remember it or store it securely</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Passphrase</label>
            <Input
              type='password'
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder={
                isReturningUser
                  ? 'Enter your passphrase'
                  : 'Enter a strong passphrase'
              }
              required
              disabled={isSubmitting}
              minLength={12}
            />
          </div>

          {!isReturningUser && (
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Confirm Passphrase</label>
              <Input
                type='password'
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder='Re-enter your passphrase'
                required
                disabled={isSubmitting}
                minLength={12}
              />
            </div>
          )}

          <Button
            type='submit'
            variant='primary'
            className='w-full'
            loading={isSubmitting}
          >
            {isReturningUser ? 'Unlock Vault' : 'Create Vault'}
          </Button>

          {isReturningUser && (
            <div className='text-center'>
              <button
                type='button'
                onClick={() => navigate('/auth/recovery')}
                className='text-sm text-foreground/60 hover:text-foreground underline'
              >
                Forgot your passphrase? Use a recovery code
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default PassphraseSetup;
