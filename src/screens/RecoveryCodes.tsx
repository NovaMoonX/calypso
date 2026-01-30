import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { RecoveryCodesService } from '@/services/RecoveryCodesService';

export function RecoveryCodes() {
  const [codes, setCodes] = useState<string[]>([]);
  const [downloaded, setDownloaded] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Generate recovery codes on mount
    const generatedCodes = RecoveryCodesService.generateRecoveryCodes();
    setCodes(generatedCodes);
    
    // Store hashed versions
    if (user) {
      RecoveryCodesService.storeRecoveryCodes(user.uid, generatedCodes);
    }
  }, [user]);

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
            <strong className="block mb-2">⚠️ CRITICAL:</strong>
            <ul className="list-disc list-inside space-y-1 text-warning-foreground/80">
              <li>Each code can only be used once</li>
              <li>Store them in a secure location (password manager, safe, etc.)</li>
              <li>These codes bypass your passphrase for account recovery</li>
              <li>Do not share these codes with anyone</li>
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
