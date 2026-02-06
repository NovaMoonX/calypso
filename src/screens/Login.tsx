import { CalypsoLogo } from '@components/Logo';
import { useAuth } from '@hooks/useAuth';
import { Button, Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { getTabId } from '@utils/tabCommunication';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { sendSignInLink } = useAuth();
  const { addToast } = useToast();

  const handleSendLink = async (e: React.SubmitEvent) => {
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
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='page flex items-center justify-center'>
      {/* Top navigation links */}
      <div className='fixed top-4 left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 z-40 flex gap-3 sm:gap-4'>
        <Link
          to='/why-use'
          className={join(
            'font-mono text-xs tracking-wider uppercase',
            'text-foreground/60 hover:text-foreground transition-colors',
            'underline decoration-foreground/20 hover:decoration-foreground/60'
          )}
        >
          Why Use?
        </Link>
        <Link
          to='/faq'
          className={join(
            'font-mono text-xs tracking-wider uppercase',
            'text-foreground/60 hover:text-foreground transition-colors',
            'underline decoration-foreground/20 hover:decoration-foreground/60'
          )}
        >
          FAQ
        </Link>
        <Link
          to='/about'
          className={join(
            'font-mono text-xs tracking-wider uppercase',
            'text-foreground/60 hover:text-foreground transition-colors',
            'underline decoration-foreground/20 hover:decoration-foreground/60'
          )}
        >
          About
        </Link>
      </div>

      <div className='w-full max-w-md space-y-8 px-4'>
        <div className='space-y-6 text-center'>
          <div className='flex justify-center'>
            <CalypsoLogo size={80} />
          </div>
          <div className='space-y-2'>
            <h1 className='font-mono text-3xl font-bold tracking-wider'>
              CALYPSO
            </h1>
            <p className='text-foreground/70 font-mono text-sm'>
              ZERO-KNOWLEDGE ENCRYPTED VAULT
            </p>
          </div>
        </div>

        {!sent ? (
          <form onSubmit={handleSendLink} className='space-y-4'>
            <div className='space-y-2'>
              <label className='font-mono text-xs tracking-wider uppercase'>
                Email Address
              </label>
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='your@email.com'
                required
                disabled={loading}
                className='font-mono'
              />
            </div>

            <Button
              type='submit'
              variant='primary'
              className='w-full font-mono tracking-wider'
              disabled={loading}
            >
              {loading ? 'SENDING...' : 'SEND SIGN-IN LINK'}
            </Button>
          </form>
        ) : (
          <div className='space-y-4 text-center'>
            <div className='border-border bg-card space-y-3 rounded-lg border p-4'>
              <p className='font-mono text-sm'>
                Check your email! We've sent a sign-in link to{' '}
                <strong className='text-foreground'>{email}</strong>
              </p>
              <p className='text-foreground/60 font-mono text-xs'>
                💡 Didn't receive it? Check your spam folder
              </p>
            </div>
            <Button
              variant='secondary'
              onClick={() => setSent(false)}
              className='w-full font-mono tracking-wider'
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
