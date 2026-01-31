import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useAuth } from '@hooks/useAuth';

export function PassphraseSetup() {
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const { user, setMasterKeyFromPassphrase } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a stored salt (returning user)
    if (user) {
      const storedSalt = window.localStorage.getItem(`salt_${user.uid}`);
      setIsReturningUser(!!storedSalt);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isReturningUser && passphrase !== confirmPassphrase) {
      addToast({ 
        title: 'Error', 
        description: 'Passphrases do not match', 
        type: 'error' 
      });
      return;
    }

    if (passphrase.length < 12) {
      addToast({ 
        title: 'Error', 
        description: 'Passphrase must be at least 12 characters long', 
        type: 'error' 
      });
      return;
    }

    setLoading(true);
    try {
      // Get stored salt if returning user
      let salt: Uint8Array | undefined;
      if (user && isReturningUser) {
        const storedSalt = window.localStorage.getItem(`salt_${user.uid}`);
        if (storedSalt) {
          try {
            const saltBinary = atob(storedSalt);
            salt = new Uint8Array(saltBinary.length);
            for (let i = 0; i < saltBinary.length; i++) {
              salt[i] = saltBinary.charCodeAt(i);
            }
          } catch (err) {
            console.error('Error parsing salt:', err);
            addToast({ 
              title: 'Error', 
              description: 'Invalid stored encryption data. Please contact support.', 
              type: 'error' 
            });
            setLoading(false);
            return;
          }
        }
      }

      await setMasterKeyFromPassphrase(passphrase, salt);
      
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
        description: 'Failed to set up encryption. Please check your passphrase and try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">
            {isReturningUser ? 'Welcome Back' : 'Set Up Encryption'}
          </h1>
          <p className="text-foreground/70">
            {isReturningUser
              ? 'Enter your passphrase to unlock your vault'
              : 'Create a strong passphrase to encrypt your data'}
          </p>
          <div className="rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm text-left">
            <strong className="block mb-2">⚠️ Important:</strong>
            <ul className="list-disc list-inside space-y-1">
              <li>Your passphrase is never stored or transmitted</li>
              <li>Without it, your data cannot be decrypted</li>
              <li>Make sure to remember it or store it securely</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Passphrase</label>
            <Input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter a strong passphrase"
              required
              disabled={loading}
              minLength={12}
            />
          </div>

          {!isReturningUser && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Passphrase</label>
              <Input
                type="password"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                placeholder="Re-enter your passphrase"
                required
                disabled={loading}
                minLength={12}
              />
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            {isReturningUser ? 'Unlock Vault' : 'Create Vault'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default PassphraseSetup;
