import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';
import { CalypsoLogo } from '@components/Logo';

export function AuthVerify() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const { signInWithEmailLink } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmail = async () => {
      const storedEmail = window.localStorage.getItem('emailForSignIn');
      
      if (!storedEmail) {
        // Show modal to ask for email
        setLoading(false);
        setShowEmailModal(true);
      } else {
        // Proceed with stored email
        await verifyEmail(storedEmail);
      }
    };

    checkEmail();
  }, []);

  const verifyEmail = async (email: string) => {
    setLoading(true);
    try {
      await signInWithEmailLink(email);
      
      // Redirect to passphrase setup
      navigate('/auth/passphrase');
    } catch (err) {
      console.error('Error verifying email:', err);
      setError('Failed to verify email. The link may be invalid or expired.');
      setLoading(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!emailInput.trim()) {
      return;
    }
    
    setShowEmailModal(false);
    await verifyEmail(emailInput);
  };

  return (
    <div className="page flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        {loading ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CalypsoLogo size={80} />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-mono font-bold tracking-wider">VERIFYING...</h1>
              <p className="text-sm text-foreground/70 font-mono">
                PLEASE WAIT WHILE WE VERIFY YOUR EMAIL
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CalypsoLogo size={80} />
            </div>
            <div className="space-y-4">
              <h1 className="text-2xl font-mono font-bold tracking-wider text-destructive">
                VERIFICATION FAILED
              </h1>
              <p className="text-sm text-foreground/70 font-mono">{error}</p>
              <Button href="/login" className="font-mono tracking-wider">
                BACK TO LOGIN
              </Button>
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
        title="Confirm Your Email"
      >
        <div className="space-y-4">
          <p className="text-sm font-mono text-foreground/70">
            Please enter your email address to complete verification
          </p>
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider">Email Address</label>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="your@email.com"
              className="font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEmailSubmit();
                }
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowEmailModal(false);
                navigate('/login');
              }}
              className="flex-1 font-mono tracking-wider"
            >
              CANCEL
            </Button>
            <Button
              variant="primary"
              onClick={handleEmailSubmit}
              disabled={!emailInput.trim()}
              className="flex-1 font-mono tracking-wider"
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
