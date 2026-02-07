/**
 * Utility functions for secure blob URL management
 * Implements JIT (Just-In-Time) Blob Decryption pattern
 */

/**
 * Creates a temporary blob URL from decrypted data
 * @param data - Decrypted data as ArrayBuffer or Uint8Array
 * @param mimeType - MIME type of the file
 * @returns Temporary blob URL
 */
export function createSecureBlobUrl(
  data: ArrayBuffer | Uint8Array,
  mimeType: string
): string {
  // Blob accepts ArrayBuffer and typed arrays
  // We know the data comes from our encryption service, so it's safe
  const blob = new Blob([data as BlobPart], { type: mimeType });
  const blobUrl = URL.createObjectURL(blob);
  return blobUrl;
}

/**
 * Revokes a blob URL to free memory
 * @param blobUrl - The blob URL to revoke
 */
export function revokeBlobUrl(blobUrl: string): void {
  if (blobUrl) {
    URL.revokeObjectURL(blobUrl);
  }
}

/**
 * Determines if a file is small enough for direct blob loading
 * Files under this threshold can be loaded entirely into memory
 */
export const SMALL_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB

/**
 * Checks if a file type supports native browser preview
 */
export function isPreviewable(mimeType: string): boolean {
  if (!mimeType) return false;
  
  return (
    mimeType.startsWith('image/') ||
    mimeType.startsWith('video/') ||
    mimeType.startsWith('audio/') ||
    mimeType === 'application/pdf' ||
    mimeType.startsWith('text/')
  );
}

/**
 * Gets the appropriate viewer component type for a file
 */
export function getViewerType(mimeType: string): 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'download' {
  if (!mimeType) return 'download';
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('text/')) return 'text';
  
  return 'download';
}
