import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@lib/firebase/FirebaseConfig';

interface UserSettings {
  salt?: string; // Base64 encoded salt
  hasPassphrase: boolean;
  verifierCiphertext?: string; // Base64 encoded encrypted verifier
  verifierIv?: string; // Base64 encoded IV for verifier
  createdAt: number;
  updatedAt: number;
}

export class UserSettingsService {
  /**
   * Get user settings from Firestore
   */
  static async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const docRef = doc(db, 'user_settings', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserSettings;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user settings:', error);
      return null;
    }
  }

  /**
   * Store salt and verifier in Firestore when user creates passphrase
   */
  static async storePassphraseData(
    userId: string, 
    salt: Uint8Array, 
    verifierCiphertext: string,
    verifierIv: string
  ): Promise<void> {
    try {
      const saltBase64 = btoa(String.fromCharCode(...Array.from(salt)));
      const docRef = doc(db, 'user_settings', userId);
      
      const settings: UserSettings = {
        salt: saltBase64,
        hasPassphrase: true,
        verifierCiphertext,
        verifierIv,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      await setDoc(docRef, settings);
    } catch (error) {
      console.error('Error storing passphrase data:', error);
      throw error;
    }
  }

  /**
   * Get passphrase verifier from Firestore
   */
  static async getVerifier(userId: string): Promise<{ ciphertext: string; iv: string } | null> {
    try {
      const settings = await this.getUserSettings(userId);
      
      if (settings?.verifierCiphertext && settings?.verifierIv) {
        return {
          ciphertext: settings.verifierCiphertext,
          iv: settings.verifierIv,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting verifier:', error);
      return null;
    }
  }

  /**
   * Get salt from Firestore
   */
  static async getSalt(userId: string): Promise<Uint8Array | null> {
    try {
      const settings = await this.getUserSettings(userId);
      
      if (settings?.salt) {
        // Decode base64 salt
        const saltString = atob(settings.salt);
        return new Uint8Array(saltString.split('').map(char => char.charCodeAt(0)));
      }
      
      return null;
    } catch (error) {
      console.error('Error getting salt:', error);
      return null;
    }
  }

  /**
   * Check if user has set up passphrase
   */
  static async hasPassphrase(userId: string): Promise<boolean> {
    try {
      const settings = await this.getUserSettings(userId);
      return settings?.hasPassphrase ?? false;
    } catch (error) {
      console.error('Error checking passphrase status:', error);
      return false;
    }
  }
}
