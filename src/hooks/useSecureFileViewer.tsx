import { useState, useEffect, useCallback } from 'react';
import { VaultItem } from '@lib/types/vault.types';
import { createSecureBlobUrl, revokeBlobUrl } from '@utils/blobUtils';
import { EncryptionService } from '@/services/EncryptionService';
import { useAuth } from '@hooks/useAuth';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@lib/firebase/FirebaseConfig';

interface UseSecureFileViewerReturn {
  blobUrl: string | null;
  isLoading: boolean;
  error: string | null;
  decryptedData: ArrayBuffer | null;
  loadFile: (item: VaultItem) => Promise<void>;
  cleanup: () => void;
}

/**
 * Hook for managing secure file viewing with JIT blob decryption
 * Handles decryption, blob creation, and memory cleanup
 */
export function useSecureFileViewer(): UseSecureFileViewerReturn {
  const { masterKey } = useAuth();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] = useState<ArrayBuffer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup function to revoke blob URL and clear decrypted data
  const cleanup = useCallback(() => {
    if (blobUrl) {
      revokeBlobUrl(blobUrl);
      setBlobUrl(null);
    }
    
    // Nullify decrypted data for memory sanitization
    setDecryptedData(null);
    setError(null);
  }, [blobUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Load and decrypt file
  const loadFile = useCallback(async (item: VaultItem) => {
    if (!masterKey) {
      setError('Master key not available');
      return;
    }

    if (!item.storagePath || !item.encryptedDek || !item.iv || !item.dekIv) {
      setError('Invalid file item');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Download encrypted file from storage
      const storageRef = ref(storage, item.storagePath);
      const downloadUrl = await getDownloadURL(storageRef);
      const response = await fetch(downloadUrl);
      const encryptedBlob = await response.blob();
      const encryptedBuffer = await encryptedBlob.arrayBuffer();

      // Convert to base64
      const encryptedBase64 = btoa(
        String.fromCharCode(...new Uint8Array(encryptedBuffer))
      );

      // Decrypt file
      const decrypted = await EncryptionService.decryptItem(
        {
          encryptedData: encryptedBase64,
          encryptedDek: item.encryptedDek,
          iv: item.iv,
          dekIv: item.dekIv,
        },
        masterKey
      );

      // Store decrypted data
      setDecryptedData(decrypted);

      // Create blob URL
      const url = createSecureBlobUrl(
        decrypted,
        item.metadata.mimeType || 'application/octet-stream'
      );
      setBlobUrl(url);
    } catch (err) {
      console.error('Error loading file:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load file';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [masterKey]);

  return {
    blobUrl,
    isLoading,
    error,
    decryptedData,
    loadFile,
    cleanup,
  };
}
