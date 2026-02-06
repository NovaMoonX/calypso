import { RecoveryCodeEntry } from '@lib/types/vault.types';
import { EncryptionService } from './EncryptionService';

/**
 * Recovery codes service for account recovery
 * Uses PBKDF2 to derive recovery keys from codes and wraps the master key
 */

export class RecoveryCodesService {
  private static readonly CODES_COUNT = 8; // 8 single-use codes as per spec
  private static readonly CODE_LENGTH = 16;
  private static readonly RECOVERY_KEY_ITERATIONS = 100000; // Lighter than master key for usability
  
  /**
   * Generate recovery codes for the user
   */
  static generateRecoveryCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < this.CODES_COUNT; i++) {
      const code = this.generateSingleCode();
      codes.push(code);
    }
    
    return codes;
  }
  
  /**
   * Generate a single recovery code using rejection sampling for uniform distribution
   */
  private static generateSingleCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      // Use rejection sampling to ensure uniform distribution
      let charIndex: number;
      do {
        const randomByte = new Uint8Array(1);
        crypto.getRandomValues(randomByte);
        charIndex = randomByte[0];
      } while (charIndex >= 256 - (256 % chars.length)); // Reject biased values
      
      code += chars[charIndex % chars.length];
      
      // Add hyphen every 4 characters for readability
      if ((i + 1) % 4 === 0 && i < this.CODE_LENGTH - 1) {
        code += '-';
      }
    }
    
    return code;
  }
  
  /**
   * Derive a recovery key from a recovery code using PBKDF2
   */
  static async deriveRecoveryKey(code: string, salt: Uint8Array): Promise<CryptoKey> {
    // Import code as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(code),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive recovery key using PBKDF2
    const recoveryKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.RECOVERY_KEY_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );

    return recoveryKey;
  }
  
  /**
   * Wrap master key with recovery key
   */
  static async wrapMasterKeyWithRecoveryKey(
    masterKey: CryptoKey,
    recoveryCode: string
  ): Promise<RecoveryCodeEntry> {
    // Generate unique salt for this recovery code
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Derive recovery key from the code
    const recoveryKey = await this.deriveRecoveryKey(recoveryCode, salt);
    
    // Wrap master key with recovery key
    const wrappedKey = await EncryptionService.encryptDEK(masterKey, recoveryKey);
    
    // Generate unique code ID
    const codeId = this.generateCodeId();
    
    return {
      codeId,
      salt: this.arrayBufferToBase64(salt.buffer as ArrayBuffer),
      wrappedMasterKey: wrappedKey.ciphertext,
      iv: wrappedKey.iv,
      usedAt: null,
    };
  }
  
  /**
   * Unwrap master key using recovery code
   */
  static async unwrapMasterKeyWithRecoveryCode(
    recoveryCode: string,
    entry: RecoveryCodeEntry
  ): Promise<CryptoKey> {
    // Decode salt from base64
    const salt = this.base64ToUint8Array(entry.salt);
    
    // Derive recovery key from the code
    const recoveryKey = await this.deriveRecoveryKey(recoveryCode, salt);
    
    // Unwrap master key
    const masterKey = await EncryptionService.decryptDEK(
      {
        ciphertext: entry.wrappedMasterKey,
        iv: entry.iv,
      },
      recoveryKey
    );
    
    return masterKey;
  }
  
  /**
   * Generate recovery code entries (wrapped master keys) from codes
   */
  static async generateRecoveryCodeEntries(
    codes: string[],
    masterKey: CryptoKey
  ): Promise<RecoveryCodeEntry[]> {
    const entries: RecoveryCodeEntry[] = [];
    
    for (const code of codes) {
      const entry = await this.wrapMasterKeyWithRecoveryKey(masterKey, code);
      entries.push(entry);
    }
    
    return entries;
  }
  
  /**
   * Generate a unique code ID
   */
  private static generateCodeId(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(8));
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Convert ArrayBuffer to Base64 string
   */
  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  /**
   * Convert Base64 string to Uint8Array
   */
  private static base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
