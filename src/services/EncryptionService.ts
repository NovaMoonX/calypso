/**
 * EncryptionService - Client-side encryption using Web Crypto API
 * Implements AES-256-GCM for zero-knowledge encryption
 */

export interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string; // Base64 encoded initialization vector
}

export interface EncryptedItem {
  encryptedData: string; // Base64 encoded encrypted content
  encryptedDek: string; // Base64 encoded encrypted DEK
  iv: string; // Base64 encoded IV for data encryption
  dekIv: string; // Base64 encoded IV for DEK encryption
}

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly SALT_LENGTH = 16;
  private static readonly PBKDF2_ITERATIONS = 600000; // OWASP 2025 recommendation

  /**
   * Derive a master key from a passphrase using PBKDF2
   */
  static async deriveMasterKey(passphrase: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    // Generate or use provided salt
    const keySalt = salt || crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));

    // Import passphrase as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive master key using PBKDF2
    const masterKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: keySalt as BufferSource,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );

    return { key: masterKey, salt: keySalt };
  }

  /**
   * Generate a random Data Encryption Key (DEK)
   */
  static async generateDEK(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt a DEK with the master key (key wrapping)
   */
  static async encryptDEK(dek: CryptoKey, masterKey: CryptoKey): Promise<EncryptedData> {
    // Export DEK as raw bytes
    const dekBytes = await crypto.subtle.exportKey('raw', dek);

    // Generate IV for DEK encryption
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    // Encrypt DEK with master key
    const encryptedDek = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv as BufferSource,
      },
      masterKey,
      dekBytes
    );

    return {
      ciphertext: this.arrayBufferToBase64(encryptedDek),
      iv: this.arrayBufferToBase64(iv.buffer as ArrayBuffer),
    };
  }

  /**
   * Decrypt a DEK with the master key (key unwrapping)
   */
  static async decryptDEK(encryptedData: EncryptedData, masterKey: CryptoKey): Promise<CryptoKey> {
    // Convert base64 to ArrayBuffer
    const encryptedDek = this.base64ToArrayBuffer(encryptedData.ciphertext);
    const iv = this.base64ToArrayBuffer(encryptedData.iv);

    // Decrypt DEK with master key
    const dekBytes = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      masterKey,
      encryptedDek
    );

    // Import decrypted DEK
    return await crypto.subtle.importKey(
      'raw',
      dekBytes,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data with a DEK
   */
  static async encryptData(data: string | ArrayBuffer, dek: CryptoKey): Promise<EncryptedData> {
    // Convert string to ArrayBuffer if necessary
    const dataBuffer = typeof data === 'string' 
      ? new TextEncoder().encode(data)
      : data;

    // Generate IV for data encryption
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    // Encrypt data with DEK
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv as BufferSource,
      },
      dek,
      dataBuffer
    );

    return {
      ciphertext: this.arrayBufferToBase64(encryptedData),
      iv: this.arrayBufferToBase64(iv.buffer as ArrayBuffer),
    };
  }

  /**
   * Decrypt data with a DEK
   */
  static async decryptData(encryptedData: EncryptedData, dek: CryptoKey): Promise<ArrayBuffer> {
    // Convert base64 to ArrayBuffer
    const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);
    const iv = this.base64ToArrayBuffer(encryptedData.iv);

    // Decrypt data with DEK
    return await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv,
      },
      dek,
      ciphertext
    );
  }

  /**
   * Decrypt data and return as string
   */
  static async decryptDataAsString(encryptedData: EncryptedData, dek: CryptoKey): Promise<string> {
    const decrypted = await this.decryptData(encryptedData, dek);
    return new TextDecoder().decode(decrypted);
  }

  /**
   * Full encryption workflow: generate DEK, encrypt data, encrypt DEK
   */
  static async encryptItem(data: string | ArrayBuffer, masterKey: CryptoKey): Promise<EncryptedItem> {
    // Generate DEK
    const dek = await this.generateDEK();

    // Encrypt data with DEK
    const encryptedData = await this.encryptData(data, dek);

    // Encrypt DEK with master key
    const encryptedDek = await this.encryptDEK(dek, masterKey);

    return {
      encryptedData: encryptedData.ciphertext,
      iv: encryptedData.iv,
      encryptedDek: encryptedDek.ciphertext,
      dekIv: encryptedDek.iv,
    };
  }

  /**
   * Full decryption workflow: decrypt DEK, decrypt data
   */
  static async decryptItem(encryptedItem: EncryptedItem, masterKey: CryptoKey): Promise<ArrayBuffer> {
    // Decrypt DEK with master key
    const dek = await this.decryptDEK(
      {
        ciphertext: encryptedItem.encryptedDek,
        iv: encryptedItem.dekIv,
      },
      masterKey
    );

    // Decrypt data with DEK
    return await this.decryptData(
      {
        ciphertext: encryptedItem.encryptedData,
        iv: encryptedItem.iv,
      },
      dek
    );
  }

  /**
   * Full decryption workflow returning string
   */
  static async decryptItemAsString(encryptedItem: EncryptedItem, masterKey: CryptoKey): Promise<string> {
    const decrypted = await this.decryptItem(encryptedItem, masterKey);
    return new TextDecoder().decode(decrypted);
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
   * Convert Base64 string to ArrayBuffer
   */
  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Export master key for session storage (use with caution)
   */
  static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Import master key from exported string
   */
  static async importKey(keyString: string): Promise<CryptoKey> {
    const keyData = this.base64ToArrayBuffer(keyString);
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Create passphrase verifier for zero-knowledge validation
   * Encrypts a known plaintext with the master key for later verification
   */
  static async createPassphraseVerifier(masterKey: CryptoKey): Promise<EncryptedData> {
    const verifierPlaintext = 'calypso-passphrase-check';
    return await this.encryptData(verifierPlaintext, masterKey);
  }

  /**
   * Verify passphrase by attempting to decrypt the verifier
   * Returns true if passphrase is correct, false otherwise
   */
  static async verifyPassphrase(verifier: EncryptedData, masterKey: CryptoKey): Promise<boolean> {
    try {
      const decrypted = await this.decryptDataAsString(verifier, masterKey);
      return decrypted === 'calypso-passphrase-check';
    } catch (error) {
      // Decryption failed - incorrect passphrase
      return false;
    }
  }
}
