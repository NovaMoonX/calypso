/**
 * Recovery codes service for account recovery
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
   * Generate a single recovery code
   */
  private static generateSingleCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = new Uint8Array(this.CODE_LENGTH);
    crypto.getRandomValues(bytes);
    
    let code = '';
    for (let i = 0; i < this.CODE_LENGTH; i++) {
      code += chars[bytes[i] % chars.length];
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
   * Verify a recovery code against a hash
   */
  static async verifyRecoveryCode(code: string, hash: string): Promise<boolean> {
    const codeHash = await this.hashRecoveryCode(code);
    return codeHash === hash;
  }
  
  /**
   * Store recovery codes in localStorage (hashed)
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
   * Check if a recovery code is valid
   */
  static async validateRecoveryCode(userId: string, code: string): Promise<boolean> {
    const stored = window.localStorage.getItem(`recovery_codes_${userId}`);
    if (!stored) return false;
    
    try {
      const { codes } = JSON.parse(stored);
      
      // Check if code matches any stored hash
      for (const hash of codes) {
        if (await this.verifyRecoveryCode(code, hash)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error validating recovery code:', error);
      return false;
    }
  }
  
  /**
   * Mark a recovery code as used
   */
  static async markCodeAsUsed(userId: string, code: string): Promise<void> {
    const stored = window.localStorage.getItem(`recovery_codes_${userId}`);
    if (!stored) return;
    
    try {
      const storage = JSON.parse(stored);
      const codeHash = await this.hashRecoveryCode(code);
      
      // Remove the used code
      storage.codes = storage.codes.filter((hash: string) => hash !== codeHash);
      
      window.localStorage.setItem(`recovery_codes_${userId}`, JSON.stringify(storage));
    } catch (error) {
      console.error('Error marking code as used:', error);
    }
  }
}
