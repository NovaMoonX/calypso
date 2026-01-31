import { createContext, useContext } from 'react';
import { VaultItem } from '@lib/types/vault.types';

export interface VaultContextType {
  items: VaultItem[];
  currentFolderId: string | null;
  currentPath: string[];
  loading: boolean;
  navigateToFolder: (folderId: string | null) => void;
  navigateBack: () => void;
  createFolder: (name: string) => Promise<void>;
  createTextItem: (name: string, content: string) => Promise<void>;
  uploadFile: (file: File, customFileName?: string) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  getDecryptedText: (itemId: string) => Promise<string>;
  getDecryptedFileUrl: (itemId: string) => Promise<string>;
  refreshItems: () => Promise<void>;
}

export const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function useVault(): VaultContextType {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
