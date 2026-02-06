import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { RecoveryCodesService } from '@/services/RecoveryCodesService';
import { UserSettingsService } from '@/services/UserSettingsService';

export function RecoveryCodes() {
  const [codes, setCodes] = useState<string[]>([]);
  const [downloaded, setDownloaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);
  const { user, masterKey } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndGenerateCodes = async () => {
      // Redirect if not authenticated
      if (!user) {
        navigate('/login');
        return;
      }

      // Check if master key is available
      if (!masterKey) {
        navigate('/auth/passphrase');
        return;
      }

      // Check if codes already exist
      const existingCodes = await UserSettingsService.getRecoveryCodes(user.uid);
      if (existingCodes.length > 0) {
        // Skip to dashboard if codes already generated
        navigate('/dashboard');
        return;
      }

      try {
        // Generate recovery codes
        const generatedCodes = RecoveryCodesService.generateRecoveryCodes();
        setCodes(generatedCodes);
        
        // Wrap master key with each recovery code
        const recoveryCodeEntries = await RecoveryCodesService.generateRecoveryCodeEntries(
          generatedCodes,
          masterKey
        );
        
        // Store wrapped recovery codes in user settings
        await UserSettingsService.storeRecoveryCodes(user.uid, recoveryCodeEntries);
        
        // Initialize key rotation metadata
        await UserSettingsService.initializeKeyRotation(user.uid);
      } catch (error) {
        console.error('Error generating recovery codes:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    checkAndGenerateCodes();
  }, [user, masterKey, navigate]);

  const handleDownload = () => {
    const codesText = codes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calypso-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (isGenerating) {
    return (
      <div className="page flex items-center justify-center">
        <div>Generating recovery codes...</div>
      </div>
    );
  }

  return (
    <div className="page flex items-center justify-center">
      <div className="w-full max-w-2xl space-y-6 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-mono font-bold tracking-wider">RECOVERY CODES</h1>
          <p className="text-sm text-foreground/70 font-mono">
            Save these codes in a secure location. You can use them to recover your account if you forget your passphrase.
          </p>
        </div>

        <div className="border border-border rounded-lg p-6 bg-card">
          <div className="grid grid-cols-2 gap-3 font-mono text-sm">
            {codes.map((code, index) => (
              <div
                key={index}
                className="p-3 bg-background rounded border border-border text-center tracking-wider"
              >
                {code}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-warning/20 bg-warning/10 p-4 text-sm font-mono">
            <strong className="block mb-2" aria-label="Critical warning">⚠️ CRITICAL:</strong>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>Each code can only be used once</li>
              <li>Store them in a secure location (password manager, safe, etc.)</li>
              <li>Download now - you won't see them again</li>
              <li>Do not share these codes with anyone</li>
              <li>You can use these to reset your passphrase if forgotten</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleDownload}
              className="flex-1 font-mono"
            >
              {downloaded ? '✓ Downloaded' : 'Download Codes'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleContinue}
              disabled={!downloaded}
              className="flex-1 font-mono"
            >
              Continue to Vault
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecoveryCodes;
