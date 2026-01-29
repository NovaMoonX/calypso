import { useState } from 'react';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useAuth } from '@hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendSignInLink } = useAuth();
  const { addToast } = useToast();

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      return;
    }

    setLoading(true);
    try {
      await sendSignInLink(email);
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
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Calypso</h1>
          <p className="text-foreground/70">
            Zero-knowledge encrypted storage vault
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSendLink} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Sign-In Link'}
            </Button>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="rounded-lg border border-primary/20 bg-primary/10 p-4">
              <p className="text-sm">
                Check your email! We've sent a sign-in link to <strong>{email}</strong>
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => setSent(false)}
              className="w-full"
            >
              Use Different Email
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
