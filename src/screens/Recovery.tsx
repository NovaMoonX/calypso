import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useAuth } from '@hooks/useAuth';
import { RecoveryCodesService } from '@/services/RecoveryCodesService';
import { UserSettingsService } from '@/services/UserSettingsService';
import { EncryptionService } from '@/services/EncryptionService';
import { KeyRotationService } from '@/services/KeyRotationService';

export function Recovery() {
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoverySuccessful, setRecoverySuccessful] = useState(false);
  const [recoveredMasterKey, setRecoveredMasterKey] = useState<CryptoKey | null>(null);
  const { user, setMasterKeyFromPassphrase } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRecoveryCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      addToast({
        title: 'Error',
        description: 'You must be logged in to recover your account',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get recovery code entries from user settings
      const recoveryCodeEntries = await UserSettingsService.getRecoveryCodes(user.uid);
      
      if (recoveryCodeEntries.length === 0) {
        addToast({
          title: 'Error',
          description: 'No recovery codes found for your account',
          type: 'error',
        });
        setIsSubmitting(false);
        return;
      }

      // Try to find matching recovery code entry
      let masterKey: CryptoKey | null = null;
      let matchedEntryIndex = -1;

      for (let i = 0; i < recoveryCodeEntries.length; i++) {
        const entry = recoveryCodeEntries[i];
        
        // Skip already used codes
        if (entry.usedAt !== null) {
          continue;
        }

        try {
          // Try to unwrap master key with this code
          const unwrappedKey = await RecoveryCodesService.unwrapMasterKeyWithRecoveryCode(
            recoveryCode.trim().toUpperCase(),
            entry
          );

          // Verify the unwrapped key with passphrase verifier
          const storedVerifier = await UserSettingsService.getVerifier(user.uid);
          if (storedVerifier) {
            const isValid = await EncryptionService.verifyPassphrase(storedVerifier, unwrappedKey);
            if (isValid) {
              masterKey = unwrappedKey;
              matchedEntryIndex = i;
              break;
            }
          }
        } catch (error) {
          // This code didn't match, try next one
          continue;
        }
      }

      if (!masterKey || matchedEntryIndex === -1) {
        addToast({
          title: 'Invalid Code',
          description: 'The recovery code you entered is invalid or has already been used',
          type: 'error',
        });
        setIsSubmitting(false);
        return;
      }

      // Mark recovery code as used
      recoveryCodeEntries[matchedEntryIndex].usedAt = Date.now();
      await UserSettingsService.storeRecoveryCodes(user.uid, recoveryCodeEntries);

      // Recovery successful!
      setRecoveredMasterKey(masterKey);
      setRecoverySuccessful(true);
      
      addToast({
        title: 'Success',
        description: 'Recovery code validated. Please set a new passphrase.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error during recovery:', error);
      addToast({
        title: 'Error',
        description: 'An error occurred during recovery. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewPassphraseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !recoveredMasterKey) {
      return;
    }

    if (newPassphrase !== confirmPassphrase) {
      addToast({
        title: 'Error',
        description: 'Passphrases do not match',
        type: 'error',
      });
      return;
    }

    if (newPassphrase.length < 12) {
      addToast({
        title: 'Error',
        description: 'Passphrase must be at least 12 characters long',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Derive new master key from new passphrase
      const { key: newMasterKey, salt: newSalt } = await EncryptionService.deriveMasterKey(newPassphrase);

      // Create new verifier
      const verifier = await EncryptionService.createPassphraseVerifier(newMasterKey);

      // Store new salt and verifier
      await UserSettingsService.storePassphraseData(
        user.uid,
        newSalt,
        verifier.ciphertext,
        verifier.iv
      );

      // Start key rotation (re-wrap all DEKs)
      await KeyRotationService.startKeyRotation(user.uid, recoveredMasterKey, newMasterKey);

      // Generate new recovery codes
      const newRecoveryCodes = RecoveryCodesService.generateRecoveryCodes();
      const newRecoveryCodeEntries = await RecoveryCodesService.generateRecoveryCodeEntries(
        newRecoveryCodes,
        newMasterKey
      );
      await UserSettingsService.storeRecoveryCodes(user.uid, newRecoveryCodeEntries);

      // Set the new master key in auth context
      await setMasterKeyFromPassphrase(newPassphrase, newSalt, false);

      addToast({
        title: 'Success',
        description: 'Passphrase reset successfully. Your vault is being re-secured.',
        type: 'success',
      });

      // Download new recovery codes
      const codesText = `NEW RECOVERY CODES - Store these securely\n\n${newRecoveryCodes.join('\n')}`;
      const blob = new Blob([codesText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'calypso-new-recovery-codes.txt';
      a.click();
      URL.revokeObjectURL(url);

      // Navigate to dashboard (key rotation will continue in background)
      navigate('/dashboard');
    } catch (error) {
      console.error('Error setting new passphrase:', error);
      addToast({
        title: 'Error',
        description: 'Failed to reset passphrase. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='page flex items-center justify-center'>
      <div className='w-full max-w-md space-y-8 px-4'>
        <div className='space-y-4 text-center'>
          <h1 className='text-4xl font-bold'>Account Recovery</h1>
          <p className='text-foreground/70'>
            {recoverySuccessful
              ? 'Enter a new passphrase to secure your vault'
              : 'Enter a recovery code to regain access to your vault'}
          </p>
        </div>

        {!recoverySuccessful ? (
          <form onSubmit={handleRecoveryCodeSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Recovery Code</label>
              <Input
                type='text'
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                placeholder='XXXX-XXXX-XXXX-XXXX'
                required
                disabled={isSubmitting}
                className='font-mono uppercase'
              />
              <p className='text-xs text-foreground/60'>
                Enter one of your 8 recovery codes
              </p>
            </div>

            <div className='border-warning/20 bg-warning/10 rounded-lg border p-4 text-left text-sm'>
              <strong className='mb-2 block'>⚠️ Important:</strong>
              <ul className='list-inside list-disc space-y-1'>
                <li>Each recovery code can only be used once</li>
                <li>After recovery, you'll need to set a new passphrase</li>
                <li>Your data will be re-encrypted with the new passphrase</li>
                <li>You'll receive new recovery codes</li>
              </ul>
            </div>

            <Button
              type='submit'
              variant='primary'
              className='w-full'
              loading={isSubmitting}
            >
              Verify Recovery Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleNewPassphraseSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium'>New Passphrase</label>
              <Input
                type='password'
                value={newPassphrase}
                onChange={(e) => setNewPassphrase(e.target.value)}
                placeholder='Enter a strong passphrase'
                required
                disabled={isSubmitting}
                minLength={12}
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Confirm New Passphrase</label>
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

            <div className='border-info/20 bg-info/10 rounded-lg border p-4 text-left text-sm'>
              <strong className='mb-2 block'>ℹ️ Next Steps:</strong>
              <ul className='list-inside list-disc space-y-1'>
                <li>Your vault items will be re-secured automatically</li>
                <li>New recovery codes will be generated and downloaded</li>
                <li>This process may take a few moments</li>
              </ul>
            </div>

            <Button
              type='submit'
              variant='primary'
              className='w-full'
              loading={isSubmitting}
            >
              Reset Passphrase
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Recovery;
