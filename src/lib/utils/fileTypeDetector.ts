/**
 * Utility functions for detecting file types from MIME types
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

/**
 * Allowed file extensions and MIME types for uploads
 */
export const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'image/svg+xml': ['.svg'],
  
  // Videos
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
  'video/ogg': ['.ogv'],
  'video/quicktime': ['.mov'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-rar-compressed': ['.rar'],
  'application/x-7z-compressed': ['.7z'],
  
  // Other
  'application/json': ['.json'],
  'text/csv': ['.csv'],
};

/**
 * Generates an accept attribute value for file input
 */
export function getAcceptAttribute(): string {
  const extensions = Object.values(ALLOWED_FILE_TYPES).flat();
  return extensions.join(',');
}
