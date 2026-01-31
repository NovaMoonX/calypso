/**
 * Utility for cross-tab communication during email verification
 * Enables seamless tab redirection after email link verification
 */

const CHANNEL_NAME = 'calypso-auth';
const TAB_ID_KEY = 'calypso-tab-id';
const ACTIVE_TABS_KEY = 'calypso-active-tabs';

export interface AuthMessage {
  type: 'AUTH_VERIFIED' | 'TAB_PING';
  targetTabId?: string;
  redirectTo?: string;
  responderId?: string;
}

/**
 * Generate a unique ID for this tab
 */
function generateTabId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get or create a unique ID for the current tab
 */
export function getTabId(): string {
  let tabId = sessionStorage.getItem(TAB_ID_KEY);
  if (!tabId) {
    tabId = generateTabId();
    sessionStorage.setItem(TAB_ID_KEY, tabId);
  }
  return tabId;
}

/**
 * Register this tab as active in localStorage
 * This allows other tabs to detect if this tab is still open
 */
export function registerTab(): void {
  const tabId = getTabId();
  const activeTabs = getActiveTabs();
  if (!activeTabs.includes(tabId)) {
    activeTabs.push(tabId);
    localStorage.setItem(ACTIVE_TABS_KEY, JSON.stringify(activeTabs));
  }
}

/**
 * Unregister this tab from active tabs
 */
export function unregisterTab(): void {
  const tabId = getTabId();
  const activeTabs = getActiveTabs();
  const filtered = activeTabs.filter(id => id !== tabId);
  localStorage.setItem(ACTIVE_TABS_KEY, JSON.stringify(filtered));
}

/**
 * Get list of active tab IDs from localStorage
 */
function getActiveTabs(): string[] {
  try {
    const stored = localStorage.getItem(ACTIVE_TABS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a specific tab is still active
 */
export function isTabActive(tabId: string): Promise<boolean> {
  return new Promise((resolve) => {
    const activeTabs = getActiveTabs();
    
    // Quick check: if not in the list, it's definitely not active
    if (!activeTabs.includes(tabId)) {
      resolve(false);
      return;
    }

    // Send a ping to verify the tab is actually responsive
    let responded = false;
    const timeoutId = setTimeout(() => {
      if (!responded) {
        resolve(false);
      }
    }, 500);

    const cleanup = listenForTabResponse((message) => {
      if (message.type === 'TAB_PING' && message.responderId === tabId) {
        responded = true;
        clearTimeout(timeoutId);
        cleanup();
        resolve(true);
      }
    });

    // Send ping via BroadcastChannel
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(CHANNEL_NAME);
      channel.postMessage({
        type: 'TAB_PING',
        targetTabId: tabId,
      });
      channel.close();
    }

    // Fallback: localStorage ping
    localStorage.setItem(
      'calypso-tab-ping',
      JSON.stringify({ targetTabId: tabId, timestamp: Date.now() })
    );
    setTimeout(() => localStorage.removeItem('calypso-tab-ping'), 100);
  });
}

/**
 * Listen for tab ping responses (internal helper)
 */
function listenForTabResponse(
  callback: (message: AuthMessage) => void
): () => void {
  const cleanupFunctions: Array<() => void> = [];

  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const handler = (event: MessageEvent<AuthMessage>) => {
      callback(event.data);
    };
    channel.addEventListener('message', handler);
    cleanupFunctions.push(() => {
      channel.removeEventListener('message', handler);
      channel.close();
    });
  }

  const storageHandler = (event: StorageEvent) => {
    if (event.key === 'calypso-tab-pong' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        callback(data);
      } catch (error) {
        console.error('Error parsing tab pong:', error);
      }
    }
  };
  window.addEventListener('storage', storageHandler);
  cleanupFunctions.push(() => {
    window.removeEventListener('storage', storageHandler);
  });

  return () => cleanupFunctions.forEach((fn) => fn());
}

/**
 * Send authentication verified message to a specific tab
 */
export function notifyAuthVerified(targetTabId: string, redirectTo: string): void {
  // Use BroadcastChannel for modern browsers
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const message: AuthMessage = {
      type: 'AUTH_VERIFIED',
      targetTabId,
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
      targetTabId,
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
 * Listen for authentication verified messages targeted at this tab
 * Returns a cleanup function to stop listening
 */
export function listenForAuthVerified(
  callback: (redirectTo: string) => void,
): () => void {
  const myTabId = getTabId();
  const cleanupFunctions: Array<() => void> = [];

  // Use BroadcastChannel for modern browsers
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    const handler = (event: MessageEvent<AuthMessage>) => {
      const isAuthVerifiedForThisTab =
        event.data.type === 'AUTH_VERIFIED' &&
        event.data.targetTabId === myTabId &&
        event.data.redirectTo;

      if (isAuthVerifiedForThisTab) {
        callback(event.data.redirectTo!);
      } else if (event.data.type === 'TAB_PING' && event.data.targetTabId === myTabId) {
        // Respond to ping requests
        const response: AuthMessage = {
          type: 'TAB_PING',
          responderId: myTabId,
        };
        channel.postMessage(response);
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
        if (data.targetTabId === myTabId && data.redirectTo) {
          callback(data.redirectTo);
        }
      } catch (error) {
        console.error('Error parsing auth redirect data:', error);
      }
    } else if (event.key === 'calypso-tab-ping' && event.newValue) {
      try {
        const data = JSON.parse(event.newValue);
        if (data.targetTabId === myTabId) {
          // Respond to ping via localStorage
          localStorage.setItem(
            'calypso-tab-pong',
            JSON.stringify({ responderId: myTabId, timestamp: Date.now() })
          );
          setTimeout(() => localStorage.removeItem('calypso-tab-pong'), 100);
        }
      } catch (error) {
        console.error('Error parsing tab ping:', error);
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
