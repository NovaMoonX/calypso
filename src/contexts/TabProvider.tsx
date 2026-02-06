import {
  listenForAuthVerified,
  registerTab,
  unregisterTab,
} from '@/utils/tabCommunication';
import { useEffect } from 'react';

export function TabProvider({ children }: { children: React.ReactNode }) {

  // Register this tab as active and listen for auth verification
  useEffect(() => {
    registerTab();

    const cleanup = listenForAuthVerified((redirectTo) => {
      // Navigate to the specified route when auth is verified in another tab
      window.location.replace(redirectTo)
    });

    const handleBeforeUnload = () => {
      unregisterTab();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanup();
    };
  }, []);

  return <>{children}</>;
}
