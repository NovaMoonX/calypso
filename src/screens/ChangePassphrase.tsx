import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useAuth } from '@hooks/useAuth';
import { UserSettingsService } from '@/services/UserSettingsService';
import { EncryptionService } from '@/services/EncryptionService';
import { KeyRotationService } from '@/services/KeyRotationService';
import { RecoveryCodesService } from '@/services/RecoveryCodesService';

export function ChangePassphrase() {
  const [currentPassphrase, setCurrentPassphrase] = useState('');
  const [newPassphrase, setNewPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, masterKey, setMasterKeyFromPassphrase } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !masterKey) {
      addToast({
        title: 'Error',
        description: 'You must be logged in to change your passphrase',
        type: 'error',
      });
      return;
    }

    if (newPassphrase !== confirmPassphrase) {
      addToast({
        title: 'Error',
        description: 'New passphrases do not match',
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

    if (currentPassphrase === newPassphrase) {
      addToast({
        title: 'Error',
        description: 'New passphrase must be different from current passphrase',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Verify current passphrase
      const salt = await UserSettingsService.getSalt(user.uid);
      if (!salt) {
        throw new Error('Could not retrieve salt');
      }

      const { key: verifyKey } = await EncryptionService.deriveMasterKey(currentPassphrase, salt);
      const storedVerifier = await UserSettingsService.getVerifier(user.uid);
      
      if (storedVerifier) {
        const isValid = await EncryptionService.verifyPassphrase(storedVerifier, verifyKey);
        if (!isValid) {
          addToast({
            title: 'Error',
            description: 'Current passphrase is incorrect',
            type: 'error',
          });
          setIsSubmitting(false);
          return;
        }
      }

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

      // Start key rotation (re-wrap all DEKs from old to new master key)
      await KeyRotationService.startKeyRotation(user.uid, masterKey, newMasterKey);

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
        description: 'Passphrase changed successfully. Your vault is being re-secured.',
        type: 'success',
      });

      // Download new recovery codes
      const codesText = `NEW RECOVERY CODES - Store these securely\n\n${newRecoveryCodes.join('\n')}\n\nYour old recovery codes are no longer valid.`;
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
      console.error('Error changing passphrase:', error);
      addToast({
        title: 'Error',
        description: 'Failed to change passphrase. Please try again.',
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
          <h1 className='text-4xl font-bold'>Change Passphrase</h1>
          <p className='text-foreground/70'>
            Update your passphrase to secure your vault with a new key
          </p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label className='text-sm font-medium'>Current Passphrase</label>
            <Input
              type='password'
              value={currentPassphrase}
              onChange={(e) => setCurrentPassphrase(e.target.value)}
              placeholder='Enter your current passphrase'
              required
              disabled={isSubmitting}
              minLength={12}
            />
          </div>

          <div className='space-y-2'>
            <label className='text-sm font-medium'>New Passphrase</label>
            <Input
              type='password'
              value={newPassphrase}
              onChange={(e) => setNewPassphrase(e.target.value)}
              placeholder='Enter a new passphrase'
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
              placeholder='Re-enter your new passphrase'
              required
              disabled={isSubmitting}
              minLength={12}
            />
          </div>

          <div className='border-warning/20 bg-warning/10 rounded-lg border p-4 text-left text-sm'>
            <strong className='mb-2 block'>⚠️ Important:</strong>
            <ul className='list-inside list-disc space-y-1'>
              <li>Your vault items will be re-secured automatically</li>
              <li>New recovery codes will be generated and downloaded</li>
              <li>Your old recovery codes will no longer work</li>
              <li>This process may take a few moments</li>
            </ul>
          </div>

          <div className='flex gap-3'>
            <Button
              type='button'
              variant='secondary'
              className='flex-1'
              onClick={() => navigate('/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='primary'
              className='flex-1'
              loading={isSubmitting}
            >
              Change Passphrase
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePassphrase;
