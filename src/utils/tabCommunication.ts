/**
 * Utility for cross-tab communication during email verification
 * Enables seamless tab redirection after email link verification
 */

const CHANNEL_NAME = 'calypso-auth';
const ORIGINAL_TAB_KEY = 'calypso-original-tab';

export interface AuthMessage {
  type: 'AUTH_VERIFIED';
  redirectTo: string;
}

/**
 * Mark the current tab as the original tab that initiated the sign-in
 */
export function markAsOriginalTab(): void {
  sessionStorage.setItem(ORIGINAL_TAB_KEY, 'true');
}

/**
 * Check if the current tab is the original tab that initiated the sign-in
 */
export function isOriginalTab(): boolean {
  return sessionStorage.getItem(ORIGINAL_TAB_KEY) === 'true';
}

/**
 * Clear the original tab marker
 */
export function clearOriginalTabMarker(): void {
  sessionStorage.removeItem(ORIGINAL_TAB_KEY);
}

/**
 * Send authentication verified message to all tabs
 */
export function notifyAuthVerified(redirectTo: string): void {
  // Use BroadcastChannel for modern browsers
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const message: AuthMessage = {
      type: 'AUTH_VERIFIED',
      redirectTo,
    };
    channel.postMessage(message);
    channel.close();
  }

  // Fallback: Use localStorage for older browsers
  // This triggers storage events in other tabs
  localStorage.setItem(
    'calypso-auth-redirect',
    JSON.stringify({
      redirectTo,
      timestamp: Date.now(),
    }),
  );

  // Clean up localStorage after a short delay
  setTimeout(() => {
    localStorage.removeItem('calypso-auth-redirect');
  }, 1000);
}

/**
 * Listen for authentication verified messages
 * Returns a cleanup function to stop listening
 */
export function listenForAuthVerified(
  callback: (redirectTo: string) => void,
): () => void {
  const cleanupFunctions: Array<() => void> = [];

  // Use BroadcastChannel for modern browsers
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const handler = (event: MessageEvent<AuthMessage>) => {
      if (event.data.type === 'AUTH_VERIFIED') {
        callback(event.data.redirectTo);
      }
    };
    channel.addEventListener('message', handler);
    cleanupFunctions.push(() => {
      channel.removeEventListener('message', handler);
      channel.close();
    });
  }

  // Fallback: Listen to localStorage events for older browsers
  const storageHandler = (event: StorageEvent) => {
    if (event.key === 'calypso-auth-redirect' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        callback(data.redirectTo);
      } catch (error) {
        console.error('Error parsing auth redirect data:', error);
      }
    }
  };
  window.addEventListener('storage', storageHandler);
  cleanupFunctions.push(() => {
    window.removeEventListener('storage', storageHandler);
  });

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

/**
 * Attempt to close the current window/tab
 * Note: This may fail due to browser security restrictions
 * Returns false immediately since window.close() doesn't provide feedback
 */
export function closeCurrentTab(): boolean {
  window.close();
  // window.close() doesn't throw errors or provide feedback
  // It will simply fail silently if not allowed by the browser
  // We return false to indicate uncertainty
  return false;
}
