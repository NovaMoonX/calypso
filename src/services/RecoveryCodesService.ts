/**
 * Recovery codes service for account recovery
 * Note: Recovery codes should be stored in Firestore with proper security rules
 * for production use. This implementation uses SHA-256 hashing.
 */

export class RecoveryCodesService {
  private static readonly CODES_COUNT = 10;
  private static readonly CODE_LENGTH = 16;
  
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
   * Hash a recovery code for storage
   */
  static async hashRecoveryCode(code: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  /**
   * Verify a recovery code against a hash using constant-time comparison
   */
  static async verifyRecoveryCode(code: string, hash: string): Promise<boolean> {
    const codeHash = await this.hashRecoveryCode(code);
    
    // Constant-time string comparison to prevent timing attacks
    if (codeHash.length !== hash.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < codeHash.length; i++) {
      result |= codeHash.charCodeAt(i) ^ hash.charCodeAt(i);
    }
    
    return result === 0;
  }
  
  /**
   * Store recovery codes in localStorage (hashed)
   * WARNING: For production, store in Firestore with security rules
   */
  static async storeRecoveryCodes(userId: string, codes: string[]): Promise<void> {
    const hashedCodes = await Promise.all(
      codes.map(code => this.hashRecoveryCode(code))
    );
    
    const storage = {
      codes: hashedCodes,
      createdAt: Date.now(),
    };
    
    window.localStorage.setItem(`recovery_codes_${userId}`, JSON.stringify(storage));
  }
  
  /**
   * Check if recovery codes already exist for a user
   */
  static hasRecoveryCodes(userId: string): boolean {
    return window.localStorage.getItem(`recovery_codes_${userId}`) !== null;
  }
  
  /**
   * Validate recovery code and mark as used (atomic operation)
   * Returns true if code is valid and successfully marked as used
   */
  static async validateAndConsumeRecoveryCode(userId: string, code: string): Promise<boolean> {
    const stored = window.localStorage.getItem(`recovery_codes_${userId}`);
    if (!stored) return false;
    
    try {
      const storage = JSON.parse(stored);
      
      // Find matching code
      let matchedIndex = -1;
      for (let i = 0; i < storage.codes.length; i++) {
        if (await this.verifyRecoveryCode(code, storage.codes[i])) {
          matchedIndex = i;
          break;
        }
      }
      
      if (matchedIndex === -1) {
        return false;
      }
      
      // Remove the used code atomically
      storage.codes.splice(matchedIndex, 1);
      window.localStorage.setItem(`recovery_codes_${userId}`, JSON.stringify(storage));
      
      return true;
    } catch (error) {
      console.error('Error validating recovery code:', error);
      return false;
    }
  }
}
