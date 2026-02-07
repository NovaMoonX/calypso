import { collection, query, where, getDocs, doc, updateDoc, limit, startAfter, orderBy, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@lib/firebase/FirebaseConfig';
import { VaultItem } from '@lib/types/vault.types';
import { EncryptionService } from './EncryptionService';
import { UserSettingsService } from './UserSettingsService';

/**
 * Key Rotation Service - Handles resumable DEK re-wrap process
 * Generic design supports both recovery and authenticated passphrase reset scenarios
 */

export interface KeyRotationProgress {
  totalItems: number;
  processedItems: number;
  percentComplete: number;
  isComplete: boolean;
}

export class KeyRotationService {
  private static readonly BATCH_SIZE = 10; // Process items in batches

  /**
   * Start a new key rotation process
   * This re-wraps all DEKs from old master key to new master key
   * 
   * @param userId - User ID
   * @param oldMasterKey - Old master key (to decrypt existing DEKs)
   * @param newMasterKey - New master key (to re-wrap DEKs)
   */
  static async startKeyRotation(
    userId: string,
    oldMasterKey: CryptoKey,
    newMasterKey: CryptoKey
  ): Promise<void> {
    // Get current key version
    const keyRotation = await UserSettingsService.getKeyRotation(userId);
    const currentVersion = keyRotation?.activeKeyVersion ?? 1;
    const newVersion = currentVersion + 1;

    // Count total items that need re-wrapping (exclude folders)
    const itemsQuery = query(
      collection(db, 'vault_items'),
      where('ownerId', '==', userId),
      where('type', '!=', 'folder')
    );

    const snapshot = await getDocs(itemsQuery);
    const totalItems = snapshot.size;

    // Initialize rotation metadata
    await UserSettingsService.updateKeyRotation(userId, {
      activeKeyVersion: newVersion,
      rotationInProgress: true,
      lastProcessedId: null,
      totalItems,
      processedItems: 0,
    });

    // Start the rotation process
    await this.continueKeyRotation(userId, oldMasterKey, newMasterKey, newVersion);
  }

  /**
   * Continue or resume a key rotation process
   * This is idempotent and can be called multiple times
   */
  static async continueKeyRotation(
    userId: string,
    oldMasterKey: CryptoKey,
    newMasterKey: CryptoKey,
    targetVersion: number
  ): Promise<KeyRotationProgress> {
    const keyRotation = await UserSettingsService.getKeyRotation(userId);
    
    if (!keyRotation || !keyRotation.rotationInProgress) {
      return {
        totalItems: 0,
        processedItems: 0,
        percentComplete: 100,
        isComplete: true,
      };
    }

    let lastDoc: DocumentSnapshot | null = null;
    let processedCount = keyRotation.processedItems ?? 0;
    const totalItems = keyRotation.totalItems ?? 0;

    // If we have a checkpoint, start from there
    if (keyRotation.lastProcessedId) {
      const checkpointDoc = await getDocs(
        query(
          collection(db, 'vault_items'),
          where('ownerId', '==', userId),
          where('type', '!=', 'folder'),
          orderBy('metadata.createdAt', 'desc')
        )
      );
      
      // Find the last processed document
      const lastProcessedDoc = checkpointDoc.docs.find(
        d => d.id === keyRotation.lastProcessedId
      );
      
      if (lastProcessedDoc) {
        lastDoc = lastProcessedDoc;
      }
    }

    // Process items in batches
    let hasMore = true;
    
    while (hasMore) {
      // Build query for next batch
      let itemsQuery = query(
        collection(db, 'vault_items'),
        where('ownerId', '==', userId),
        where('type', '!=', 'folder'),
        orderBy('metadata.createdAt', 'desc'),
        limit(this.BATCH_SIZE)
      );

      // Resume from checkpoint if exists
      if (lastDoc) {
        itemsQuery = query(
          collection(db, 'vault_items'),
          where('ownerId', '==', userId),
          where('type', '!=', 'folder'),
          orderBy('metadata.createdAt', 'desc'),
          startAfter(lastDoc),
          limit(this.BATCH_SIZE)
        );
      }

      const snapshot = await getDocs(itemsQuery);
      
      if (snapshot.empty) {
        hasMore = false;
        break;
      }

      // Process this batch
      for (const itemDoc of snapshot.docs) {
        const item = { id: itemDoc.id, ...itemDoc.data() } as VaultItem;
        
        // Skip if already at target version or is a folder
        if (item.keyVersion === targetVersion || item.type === 'folder') {
          continue;
        }

        // Skip if missing encryption data
        if (!item.encryptedDek || !item.dekIv) {
          continue;
        }

        try {
          // Decrypt DEK with old master key
          const dek = await EncryptionService.decryptDEK(
            {
              ciphertext: item.encryptedDek,
              iv: item.dekIv,
            },
            oldMasterKey
          );

          // Re-wrap DEK with new master key
          const newEncryptedDek = await EncryptionService.encryptDEK(dek, newMasterKey);

          // Update item with new wrapped DEK and version
          await updateDoc(doc(db, 'vault_items', item.id), {
            encryptedDek: newEncryptedDek.ciphertext,
            dekIv: newEncryptedDek.iv,
            keyVersion: targetVersion,
          });

          processedCount++;
          
          // Update checkpoint
          await UserSettingsService.updateKeyRotation(userId, {
            lastProcessedId: item.id,
            processedItems: processedCount,
          });
        } catch (error) {
          console.error(`Error re-wrapping item ${item.id}:`, error);
          // Continue with other items even if one fails
        }
      }

      // Update last document for pagination
      lastDoc = snapshot.docs[snapshot.docs.length - 1];
      
      // Check if we've processed all items
      if (snapshot.docs.length < this.BATCH_SIZE) {
        hasMore = false;
      }
    }

    // Mark rotation as complete
    await UserSettingsService.updateKeyRotation(userId, {
      rotationInProgress: false,
      lastProcessedId: null,
    });

    return {
      totalItems,
      processedItems: processedCount,
      percentComplete: totalItems > 0 ? Math.round((processedCount / totalItems) * 100) : 100,
      isComplete: true,
    };
  }

  /**
   * Get current rotation progress
   */
  static async getRotationProgress(userId: string): Promise<KeyRotationProgress> {
    const keyRotation = await UserSettingsService.getKeyRotation(userId);
    
    if (!keyRotation) {
      return {
        totalItems: 0,
        processedItems: 0,
        percentComplete: 100,
        isComplete: true,
      };
    }

    const totalItems = keyRotation.totalItems ?? 0;
    const processedItems = keyRotation.processedItems ?? 0;
    const percentComplete = totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 100;

    return {
      totalItems,
      processedItems,
      percentComplete,
      isComplete: !keyRotation.rotationInProgress,
    };
  }

  /**
   * Check if rotation is in progress
   */
  static async isRotationInProgress(userId: string): Promise<boolean> {
    const keyRotation = await UserSettingsService.getKeyRotation(userId);
    return keyRotation?.rotationInProgress ?? false;
  }
}
