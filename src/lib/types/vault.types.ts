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
  keyVersion?: number; // Version of master key used to wrap the DEK
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
  keyVersion?: number;
}

/**
 * Recovery code entry with wrapped master key
 */
export interface RecoveryCodeEntry {
  codeId: string; // Public identifier for the code
  salt: string; // Base64 encoded salt for recovery key derivation
  wrappedMasterKey: string; // Base64 encoded master key encrypted with recovery key
  iv: string; // Base64 encoded IV for master key encryption
  usedAt: number | null; // Timestamp when code was used, null if unused
}

/**
 * Key rotation metadata for resumable re-wrap process
 */
export interface KeyRotationMetadata {
  activeKeyVersion: number; // Current master key version
  rotationInProgress: boolean; // True during re-wrap process
  lastProcessedId: string | null; // Checkpoint for resume
  totalItems: number | null; // Total items to process
  processedItems: number | null; // Items processed so far
}
