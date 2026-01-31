/**
 * Vault item types and interfaces
 */

export type VaultItemType = 'folder' | 'text' | 'image' | 'video' | 'file';

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
  parentId?: string; // undefined for root items
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

export interface CreateVaultItemInput {
  parentId?: string;
  type: VaultItemType;
  metadata: VaultItemMetadata;
  encryptedData?: string;
  storagePath?: string;
  encryptedDek?: string;
  iv?: string;
  dekIv?: string;
}
