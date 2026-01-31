import { createContext, useContext } from 'react';
import { User } from 'firebase/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  masterKey: CryptoKey | null;
  salt: Uint8Array | null;
  signInWithEmailLink: (email: string) => Promise<void>;
  sendSignInLink: (email: string) => Promise<void>;
  setMasterKeyFromPassphrase: (passphrase: string, salt?: Uint8Array, isNewPassphrase?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
