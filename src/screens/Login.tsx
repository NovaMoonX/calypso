import { useState, useEffect } from 'react';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useAuth } from '@hooks/useAuth';
import { CalypsoLogo } from '@components/Logo';
import {
  getTabId,
  registerTab,
  unregisterTab,
  listenForAuthVerified,
} from '@utils/tabCommunication';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendSignInLink } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Register this tab as active and listen for auth verification
  useEffect(() => {
    registerTab();

    const cleanup = listenForAuthVerified((redirectTo) => {
      // Navigate to the specified route when auth is verified in another tab
      navigate(redirectTo);
    });

    return () => {
      cleanup();
      unregisterTab();
    };
  }, [navigate]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      // Pass the current tab ID so the email link knows which tab to redirect
      const tabId = getTabId();
      await sendSignInLink(email, tabId);
      setSent(true);
    } catch (error) {
      console.error('Error sending sign-in link:', error);
      addToast({ 
        title: 'Error', 
        description: 'Failed to send sign-in link. Please try again.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <CalypsoLogo size={80} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-mono font-bold tracking-wider">CALYPSO</h1>
            <p className="text-sm text-foreground/70 font-mono">
              ZERO-KNOWLEDGE ENCRYPTED VAULT
            </p>
          </div>
        </div>

        {!sent ? (
          <form onSubmit={handleSendLink} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="font-mono"
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              className="w-full font-mono tracking-wider"
              disabled={loading}
            >
              {loading ? 'SENDING...' : 'SEND SIGN-IN LINK'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-border bg-card p-4 space-y-3">
              <p className="text-sm font-mono">
                Check your email! We've sent a sign-in link to <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-xs text-foreground/60 font-mono">
                💡 Didn't receive it? Check your spam folder
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setSent(false)}
              className="w-full font-mono tracking-wider"
            >
              USE DIFFERENT EMAIL
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
