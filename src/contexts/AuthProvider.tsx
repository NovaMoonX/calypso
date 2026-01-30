import { useState, useEffect, ReactNode } from 'react';
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
  const [salt, setSalt] = useState<Uint8Array | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const sendSignInLink = async (email: string) => {
    const actionCodeSettings = {
      url: window.location.origin + '/auth/verify',
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    
    // Save email to local storage for verification
    window.localStorage.setItem('emailForSignIn', email);
  };

  const signInWithEmailLink = async (email: string) => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      await firebaseSignInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
    }
  };

  const setMasterKeyFromPassphrase = async (passphrase: string, providedSalt?: Uint8Array) => {
    const result = await EncryptionService.deriveMasterKey(passphrase, providedSalt);
    
    setMasterKey(result.key);
    setSalt(result.salt);

    // Store salt in localStorage for this user session
    if (user) {
      const saltBase64 = btoa(String.fromCharCode(...Array.from(result.salt)));
      window.localStorage.setItem(`salt_${user.uid}`, saltBase64);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setMasterKey(null);
    setSalt(null);
    
    // Clear stored data
    if (user) {
      window.localStorage.removeItem(`salt_${user.uid}`);
    }
    
    // Redirect to login page
    window.location.href = '/login';
  };

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
