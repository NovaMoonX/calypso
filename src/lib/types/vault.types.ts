/**
 * Vault item types and interfaces
 */

export type VaultItemType = 'folder' | 'text' | 'image' | 'video' | 'file' | 'password';

export interface VaultItemMetadata {
  name: string;
  size?: number;
  mimeType?: string;
  createdAt: number;
  updatedAt: number;
}

export interface VaultItem {
  id: string;
  ownerId: string;
  parentId: string | null; // null for root items
  type: VaultItemType;
  metadata: VaultItemMetadata;
  
  // For encrypted text
  encryptedData?: string;
  
  // For files (image, video, file)
  storagePath?: string;
  
  // Encryption data (not present for folders)
  encryptedDek?: string;
  iv?: string;
  dekIv?: string;
}

export interface PasswordItemData {
  title?: string;
  username: string;
  password: string;
  notes?: string;
}

export interface PasswordItem {
  id: string;
  ownerId: string;
  type: 'password';
  metadata: {
    name: string; // Display name for the password item
    createdAt: number;
    updatedAt: number;
  };
  encryptedData: string; // Encrypted PasswordItemData
  encryptedDek: string;
  iv: string;
  dekIv: string;
}

export interface CreateVaultItemInput {
  parentId: string | null;
  type: VaultItemType;
  metadata: VaultItemMetadata;
  encryptedData?: string;
  storagePath?: string;
  encryptedDek?: string;
  iv?: string;
  dekIv?: string;
}
