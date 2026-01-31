/**
 * File utility functions for handling file operations
 */

import { VaultItemType } from '@lib/types/vault.types';

/**
 * Detects the vault item type based on the file's MIME type
 */
export function detectFileType(mimeType: string): 'image' | 'video' | 'file' {
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  
  if (mimeType.startsWith('video/')) {
    return 'video';
  }
  
  return 'file';
}

/**
 * Returns a human-readable file type label
 */
export function getFileTypeLabel(type: VaultItemType): string {
  switch (type) {
    case 'image':
      return 'Image';
    case 'video':
      return 'Video';
    case 'file':
      return 'File';
    case 'text':
      return 'Text';
    case 'folder':
      return 'Folder';
  }
}
