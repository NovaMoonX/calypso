import { useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink as firebaseSignInWithEmailLink,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@lib/firebase/FirebaseConfig';
import { AuthContext } from '@hooks/useAuth';
import { EncryptionService } from '@/services/EncryptionService';
import { UserSettingsService } from '@/services/UserSettingsService';
import { TAB_ID_PARAM } from '@utils/tabCommunication';

interface AuthProviderProps {
  children: ReactNode;
}

export const EMAIL_FOR_SIGN_IN_KEY = 'emailForSignIn';

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [salt, setSalt] = useState<Uint8Array | null>(null);

  // Shared reset logic for clearing user session data
  const resetSessionData = useCallback(() => {
    setMasterKey(null);
    setSalt(null);
    // Note: We don't remove salt from Firestore or localStorage on sign out
    // This allows returning users to use their existing passphrase
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      // Reset session data when user signs out
      if (!currentUser) {
        resetSessionData();
      }
    });

    return unsubscribe;
  }, [resetSessionData]);

  const sendSignInLink = useCallback(async (email: string, tabId?: string) => {
    const actionCodeSettings = {
      url: `${window.location.origin}/auth/verify${tabId ? `?${TAB_ID_PARAM}=${tabId}` : ''}`,
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Save email to local storage for verification
    window.localStorage.setItem(EMAIL_FOR_SIGN_IN_KEY, email);
  }, []);

  const signInWithEmailLink = useCallback(async (email: string) => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      await firebaseSignInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem(EMAIL_FOR_SIGN_IN_KEY);
    }
  }, []);

  const setMasterKeyFromPassphrase = useCallback(async (
    passphrase: string,
    providedSalt?: Uint8Array,
    isNewPassphrase: boolean = false,
  ) => {
    const result = await EncryptionService.deriveMasterKey(passphrase, providedSalt);
    
    setMasterKey(result.key);
    setSalt(result.salt);

    // Store salt and verifier in Firestore if this is a new passphrase
    if (user && isNewPassphrase) {
      // Create verifier for zero-knowledge passphrase validation
      const verifier = await EncryptionService.createPassphraseVerifier(result.key);
      await UserSettingsService.storePassphraseData(
        user.uid, 
        result.salt,
        verifier.ciphertext,
        verifier.iv
      );
    } else if (user && !isNewPassphrase) {
      // Verify passphrase for returning users
      const storedVerifier = await UserSettingsService.getVerifier(user.uid);
      if (storedVerifier) {
        const isValid = await EncryptionService.verifyPassphrase(storedVerifier, result.key);
        if (!isValid) {
          throw new Error('Invalid passphrase');
        }
      }
    }
  }, [user]);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    resetSessionData();
    
    // Redirect to login page
    window.location.href = '/login';
  }, [resetSessionData]);

  const contextValue = {
    user,
    loading,
    masterKey,
    salt,
    signInWithEmailLink,
    sendSignInLink,
    setMasterKeyFromPassphrase,
    signOut,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
