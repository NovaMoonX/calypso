import { createContext, useContext } from 'react';
import { PasswordItem, PasswordItemData } from '@lib/types/vault.types';

interface PasswordsContextType {
  passwords: PasswordItem[];
  loading: boolean;
  createPassword: (name: string, data: PasswordItemData) => Promise<void>;
  updatePassword: (id: string, name: string, data: PasswordItemData) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  getDecryptedPassword: (id: string) => Promise<PasswordItemData>;
  refreshPasswords: () => Promise<void>;
}

export const PasswordsContext = createContext<PasswordsContextType | undefined>(undefined);

export function usePasswords() {
  const context = useContext(PasswordsContext);
  if (!context) {
    throw new Error('usePasswords must be used within a PasswordsProvider');
  }
  return context;
}
