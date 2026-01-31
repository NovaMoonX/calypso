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
  updateDoc,
} from 'firebase/firestore';
import { db } from '@lib/firebase/FirebaseConfig';
import { PasswordsContext } from '@hooks/usePasswords';
import { useAuth } from '@hooks/useAuth';
import { PasswordItem, PasswordItemData } from '@lib/types/vault.types';
import { EncryptionService } from '@/services/EncryptionService';

interface PasswordsProviderProps {
  children: ReactNode;
}

export function PasswordsProvider({ children }: PasswordsProviderProps) {
  const { user, masterKey } = useAuth();
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Load all password items
  const loadPasswords = useCallback(async () => {
    if (!user) {
      setPasswords([]);
      return;
    }

    setLoading(true);
    try {
      const passwordsQuery = query(
        collection(db, 'password_items'),
        where('ownerId', '==', user.uid),
        orderBy('metadata.createdAt', 'desc')
      );

      const snapshot = await getDocs(passwordsQuery);
      const loadedPasswords = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as PasswordItem[];

      setPasswords(loadedPasswords);
    } catch (error) {
      console.error('Error loading password items:', error);
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPasswords();
  }, [loadPasswords]);

  const createPassword = async (name: string, data: PasswordItemData) => {
    if (!user || !masterKey) {
      throw new Error('User not authenticated or master key not set');
    }

    // Encrypt the password data as JSON
    const dataString = JSON.stringify(data);
    const encrypted = await EncryptionService.encryptItem(dataString, masterKey);

    const newPassword = {
      ownerId: user.uid,
      type: 'password' as const,
      metadata: {
        name,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      encryptedData: encrypted.encryptedData,
      encryptedDek: encrypted.encryptedDek,
      iv: encrypted.iv,
      dekIv: encrypted.dekIv,
    };

    await addDoc(collection(db, 'password_items'), newPassword);
    await loadPasswords();
  };

  const updatePassword = async (id: string, name: string, data: PasswordItemData) => {
    if (!user || !masterKey) {
      throw new Error('User not authenticated or master key not set');
    }

    // Encrypt the password data as JSON
    const dataString = JSON.stringify(data);
    const encrypted = await EncryptionService.encryptItem(dataString, masterKey);

    await updateDoc(doc(db, 'password_items', id), {
      'metadata.name': name,
      'metadata.updatedAt': Date.now(),
      encryptedData: encrypted.encryptedData,
      encryptedDek: encrypted.encryptedDek,
      iv: encrypted.iv,
      dekIv: encrypted.dekIv,
    });

    await loadPasswords();
  };

  const deletePassword = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    await deleteDoc(doc(db, 'password_items', id));
    await loadPasswords();
  };

  const getDecryptedPassword = async (id: string): Promise<PasswordItemData> => {
    if (!masterKey) {
      throw new Error('Master key not set');
    }

    const passwordDoc = await getDoc(doc(db, 'password_items', id));
    if (!passwordDoc.exists()) {
      throw new Error('Password item not found');
    }

    const password = passwordDoc.data() as PasswordItem;

    const decrypted = await EncryptionService.decryptItemAsString(
      {
        encryptedData: password.encryptedData,
        encryptedDek: password.encryptedDek,
        iv: password.iv,
        dekIv: password.dekIv,
      },
      masterKey
    );

    return JSON.parse(decrypted) as PasswordItemData;
  };

  const refreshPasswords = async () => {
    await loadPasswords();
  };

  const contextValue = {
    passwords,
    loading,
    createPassword,
    updatePassword,
    deletePassword,
    getDecryptedPassword,
    refreshPasswords,
  };

  return <PasswordsContext.Provider value={contextValue}>{children}</PasswordsContext.Provider>;
}
