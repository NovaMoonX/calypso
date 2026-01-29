import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { useAuth } from '@hooks/useAuth';

export function AuthVerify() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { signInWithEmailLink } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        let email = window.localStorage.getItem('emailForSignIn');
        
        if (!email) {
          email = window.prompt('Please provide your email for confirmation');
        }

        if (!email) {
          setError('Email is required for verification');
          setLoading(false);
          return;
        }

        await signInWithEmailLink(email);
        
        // Redirect to passphrase setup
        navigate('/auth/passphrase');
      } catch (err) {
        console.error('Error verifying email:', err);
        setError('Failed to verify email. The link may be invalid or expired.');
        setLoading(false);
      }
    };

    verifyEmail();
  }, [signInWithEmailLink, navigate]);

  return (
    <div className="page flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 px-4 text-center">
        {loading ? (
          <>
            <h1 className="text-3xl font-bold">Verifying...</h1>
            <p className="text-foreground/70">Please wait while we verify your email</p>
          </>
        ) : error ? (
          <>
            <h1 className="text-3xl font-bold text-destructive">Verification Failed</h1>
            <p className="text-foreground/70">{error}</p>
            <Button href="/login">Back to Login</Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default AuthVerify;
