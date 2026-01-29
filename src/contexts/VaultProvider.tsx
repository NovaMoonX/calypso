import { useState, useEffect, ReactNode, useCallback } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@lib/firebase/FirebaseConfig';
import { VaultContext } from '@hooks/useVault';
import { useAuth } from '@hooks/useAuth';
import { VaultItem, CreateVaultItemInput } from '@lib/types/vault.types';
import { EncryptionService } from '@/services/EncryptionService';

interface VaultProviderProps {
  children: ReactNode;
}

export function VaultProvider({ children }: VaultProviderProps) {
  const { user, masterKey } = useAuth();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>(['Root']);
  const [loading, setLoading] = useState(false);

  // Load items for current folder
  const loadItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const itemsQuery = query(
        collection(db, 'vault_items'),
        where('ownerId', '==', user.uid),
        where('parentId', '==', currentFolderId),
        orderBy('metadata.createdAt', 'desc')
      );

      const snapshot = await getDocs(itemsQuery);
      const loadedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VaultItem[];

      setItems(loadedItems);
    } catch (error) {
      console.error('Error loading vault items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentFolderId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Build current path
  const buildPath = useCallback(async (folderId: string | null): Promise<string[]> => {
    if (!folderId || !user) {
      return ['Root'];
    }

    const path: string[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const itemDoc = await getDoc(doc(db, 'vault_items', currentId));
      if (itemDoc.exists()) {
        const item = itemDoc.data() as VaultItem;
        path.unshift(item.metadata.name);
        currentId = item.parentId;
      } else {
        break;
      }
    }

    path.unshift('Root');
    return path;
  }, [user]);

  const navigateToFolder = useCallback(async (folderId: string | null) => {
    setCurrentFolderId(folderId);
    const path = await buildPath(folderId);
    setCurrentPath(path);
  }, [buildPath]);

  const navigateBack = useCallback(async () => {
    if (!currentFolderId || !user) {
      return;
    }

    // Get current folder to find its parent
    const itemDoc = await getDoc(doc(db, 'vault_items', currentFolderId));
    if (itemDoc.exists()) {
      const item = itemDoc.data() as VaultItem;
      await navigateToFolder(item.parentId);
    }
  }, [currentFolderId, user, navigateToFolder]);

  const createFolder = async (name: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const newFolder: CreateVaultItemInput = {
      parentId: currentFolderId,
      type: 'folder',
      metadata: {
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    };

    await addDoc(collection(db, 'vault_items'), {
      ...newFolder,
      ownerId: user.uid,
    });

    await loadItems();
  };

  const createTextItem = async (name: string, content: string) => {
    if (!user || !masterKey) {
      throw new Error('User not authenticated or master key not set');
    }

    // Encrypt the text content
    const encrypted = await EncryptionService.encryptItem(content, masterKey);

    const newItem: CreateVaultItemInput = {
      parentId: currentFolderId,
      type: 'text',
      metadata: {
        name,
        size: content.length,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      encryptedData: encrypted.encryptedData,
      encryptedDek: encrypted.encryptedDek,
      iv: encrypted.iv,
      dekIv: encrypted.dekIv,
    };

    await addDoc(collection(db, 'vault_items'), {
      ...newItem,
      ownerId: user.uid,
    });

    await loadItems();
  };

  const uploadFile = async (file: File, type: 'image' | 'video' | 'file') => {
    if (!user || !masterKey) {
      throw new Error('User not authenticated or master key not set');
    }

    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Encrypt the file
    const encrypted = await EncryptionService.encryptItem(fileBuffer, masterKey);

    // Convert encrypted data to blob
    const encryptedBlob = new Blob(
      [Uint8Array.from(atob(encrypted.encryptedData), c => c.charCodeAt(0))],
      { type: 'application/octet-stream' }
    );

    // Upload to Firebase Storage
    const storagePath = `vault/${user.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, encryptedBlob);

    // Create vault item
    const newItem: CreateVaultItemInput = {
      parentId: currentFolderId,
      type,
      metadata: {
        name: file.name,
        size: file.size,
        mimeType: file.type,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      storagePath,
      encryptedDek: encrypted.encryptedDek,
      iv: encrypted.iv,
      dekIv: encrypted.dekIv,
    };

    await addDoc(collection(db, 'vault_items'), {
      ...newItem,
      ownerId: user.uid,
    });

    await loadItems();
  };

  const deleteItem = async (itemId: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get item to check if it has a storage path
    const itemDoc = await getDoc(doc(db, 'vault_items', itemId));
    if (itemDoc.exists()) {
      const item = itemDoc.data() as VaultItem;
      
      // Delete from storage if it's a file
      if (item.storagePath) {
        try {
          const storageRef = ref(storage, item.storagePath);
          await deleteObject(storageRef);
        } catch (error) {
          console.error('Error deleting file from storage:', error);
        }
      }

      // Delete from Firestore
      await deleteDoc(doc(db, 'vault_items', itemId));

      await loadItems();
    }
  };

  const getDecryptedText = async (itemId: string): Promise<string> => {
    if (!masterKey) {
      throw new Error('Master key not set');
    }

    const itemDoc = await getDoc(doc(db, 'vault_items', itemId));
    if (!itemDoc.exists()) {
      throw new Error('Item not found');
    }

    const item = itemDoc.data() as VaultItem;
    
    if (item.type !== 'text' || !item.encryptedData || !item.encryptedDek || !item.iv || !item.dekIv) {
      throw new Error('Invalid text item');
    }

    const decrypted = await EncryptionService.decryptItemAsString(
      {
        encryptedData: item.encryptedData,
        encryptedDek: item.encryptedDek,
        iv: item.iv,
        dekIv: item.dekIv,
      },
      masterKey
    );

    return decrypted;
  };

  const getDecryptedFileUrl = async (itemId: string): Promise<string> => {
    if (!masterKey) {
      throw new Error('Master key not set');
    }

    const itemDoc = await getDoc(doc(db, 'vault_items', itemId));
    if (!itemDoc.exists()) {
      throw new Error('Item not found');
    }

    const item = itemDoc.data() as VaultItem;
    
    if (!item.storagePath || !item.encryptedDek || !item.iv || !item.dekIv) {
      throw new Error('Invalid file item');
    }

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

    // Create blob URL
    const blob = new Blob([decrypted], { type: item.metadata.mimeType || 'application/octet-stream' });
    return URL.createObjectURL(blob);
  };

  const refreshItems = async () => {
    await loadItems();
  };

  const contextValue = {
    items,
    currentFolderId,
    currentPath,
    loading,
    navigateToFolder,
    navigateBack,
    createFolder,
    createTextItem,
    uploadFile,
    deleteItem,
    getDecryptedText,
    getDecryptedFileUrl,
    refreshItems,
  };

  return <VaultContext.Provider value={contextValue}>{children}</VaultContext.Provider>;
}
