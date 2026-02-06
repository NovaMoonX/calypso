# Calypso

A zero-knowledge encrypted storage vault for securely storing sensitive digital material (notes, images, videos, files).

## Features

### Security & Encryption
- 🔐 **Zero-Knowledge Encryption**: All data is encrypted on the client-side before being sent to Firebase
- 🔑 **AES-256-GCM Encryption**: Military-grade encryption using Web Crypto API
- 🔒 **PBKDF2 Key Derivation**: 600,000 iterations (OWASP 2025 standard)
- 🎫 **Recovery Codes**: 8 single-use recovery codes with master key wrapping (PBKDF2-based recovery keys)
- 🔄 **Resumable Key Rotation**: Automatic re-encryption of data when passphrase is changed with progress tracking
- 🛡️ **Timing Attack Protection**: Constant-time comparisons for security-critical operations
- 📦 **Per-Item Encryption**: Each item has a unique Data Encryption Key (DEK)
- ☁️ **Cloud Salt Storage**: Encryption salt stored securely in Firestore for seamless re-authentication
- 🔐 **Passphrase Change**: Change your passphrase anytime with automatic vault re-securing

### Authentication & Access
- 📧 **Passwordless Authentication**: Firebase Email Link authentication
- ✉️ **Smart Email Hints**: Spam folder reminder for better user experience
- 🔄 **Seamless Tab Experience**: Email verification automatically closes the new tab and returns you to the original tab, even when sign-in is initiated from multiple tabs
- 🔐 **Passphrase Protection**: Minimum 12-character passphrase requirement
- 🔄 **Persistent Authentication**: Salt stored in Firestore allows seamless return without passphrase recreation
- 🚪 **Auto Sign-Out Redirect**: Secure redirect to login on sign-out
- 🛡️ **Protected Routes**: Authentication guards prevent unauthorized page access

### Data Management
- 📁 **Nested Folders**: Organize your encrypted data with unlimited folder hierarchy
- 📝 **Multiple File Types**: Store text, images, videos, and files (50MB max per file)
- 🔍 **Auto-Detection**: File types automatically detected from MIME type during upload
- ✏️ **File Renaming**: Rename files before uploading to the vault
- 🛡️ **Flexible File Support**: Upload any file type including custom document formats (50MB max per file)
- 🗂️ **Smart Navigation**: Back button with breadcrumb path display

### User Interface
- 🌑 **Monochrome Security Theme**: Pure grayscale design (black, gray, white)
- 🖥️ **Monospace Typography**: Terminal-inspired aesthetic with UPPERCASE labels
- 🎨 **Light/Dark Theme Support**: Switch between themes seamlessly
- 🔰 **Custom "C" Logo**: Secure vault door design
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎯 **Modal-Based Flows**: Professional UI components instead of browser prompts

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Library**: [Dreamer UI](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui)
- **Backend**: Google Firebase (Authentication, Firestore, Storage)
- **Encryption**: Web Crypto API with AES-256-GCM

## Security Architecture

### Zero-Knowledge Encryption

Calypso implements a comprehensive zero-knowledge encryption system where your data is completely private:

1. **Master Key Derivation**: When you create your vault, a master key is derived from your passphrase using PBKDF2-SHA256 with 600,000 iterations (OWASP 2025 standard)
2. **Salt Storage**: The cryptographic salt is securely stored in Firestore, allowing you to re-enter your passphrase on any device without recreating your vault
3. **Passphrase Verifier**: A small encrypted verifier blob (containing known plaintext "calypso-passphrase-check") is created and stored in Firestore when you first set your passphrase
4. **Zero-Knowledge Validation**: When you return, your passphrase is validated by deriving the key with the stored salt and attempting to decrypt the verifier - success means correct passphrase
5. **Data Encryption Keys (DEK)**: Each item (text/file) has a unique randomly generated 256-bit DEK
6. **Key Wrapping**: DEKs are encrypted with the master key before storage in Firestore
7. **Client-Side Only**: All encryption/decryption happens in your browser. Firebase only stores encrypted data
8. **No Passphrase Storage**: Your passphrase is never stored or transmitted - it exists only in memory during your session

### Security Features

- **Passphrase Verifier**: Zero-knowledge passphrase validation using encrypted verifier blob
- **Recovery Code System**: 8 recovery codes that wrap the master key using PBKDF2-derived recovery keys (100,000 iterations)
- **Master Key Wrapping**: Recovery codes decrypt the master key, which is then verified against the passphrase verifier
- **Resumable Key Rotation**: When passphrase changes, all DEKs are automatically re-wrapped with the new master key
- **Progress Tracking**: Key rotation process tracks progress and can resume if interrupted
- **Constant-Time Comparisons**: Security-critical operations use timing-attack-resistant comparisons
- **Rejection Sampling**: Cryptographically secure random code generation with uniform distribution
- **Atomic Operations**: Recovery code validation and consumption happen atomically to prevent race conditions
- **Owner Verification**: Firestore security rules prevent ownerId modification and enforce strict access control
- **Storage Access Control**: Storage rules restrict file access to owners and enforce the 50MB limit
- **Secure Session Management**: Master key held in memory only, cleared on sign-out
- **Cloud Salt Storage**: Salt stored in Firestore with strict access control (user can only access their own)
- **One-Time Passphrase Setup**: Set your passphrase once; returning users simply enter it to unlock their vault
- **No Direct Passphrase Storage**: Passphrase correctness verified by decrypting a known verifier, not by comparing stored values
- **Key Versioning**: Each vault item tracks which master key version was used to encrypt it

### Data Flow

1. User provides passphrase → Master Key derived (never stored)
2. Item created → Random DEK generated
3. Item encrypted with DEK → DEK encrypted with Master Key
4. Encrypted item + Encrypted DEK stored in Firebase
5. To decrypt: Retrieve from Firebase → Decrypt DEK with Master Key → Decrypt item with DEK

### Recovery Workflow

Calypso provides a secure account recovery mechanism using recovery codes:

#### Initial Setup
1. When you create your vault, 8 recovery codes are generated
2. For each recovery code:
   - A unique salt is generated
   - The recovery code is used to derive a recovery key via PBKDF2 (100,000 iterations)
   - Your master key is encrypted (wrapped) with the recovery key
   - The wrapped master key, salt, and IV are stored in Firestore
3. Recovery codes are shown once and must be downloaded/saved securely

#### Recovery Process
1. Navigate to the recovery page from the passphrase screen
2. Enter one of your 8 recovery codes
3. System derives the recovery key from your code
4. Recovery key unwraps the master key
5. Master key is verified against the passphrase verifier
6. If valid:
   - Recovery code is marked as used (single-use)
   - You set a new passphrase
   - Key rotation begins automatically
   - New recovery codes are generated and downloaded
   - Old recovery codes are invalidated

**Important**: Each recovery code can only be used once. After recovery, you receive new codes.

### Resumable Key Rotation Process

When you change your passphrase (via recovery or authenticated change), all your vault items must be re-secured:

#### How It Works
1. **Initiation**: When passphrase changes, a new master key is derived
2. **Key Wrapping Only**: Data is NOT re-encrypted - only the DEKs are re-wrapped
3. **Batch Processing**: Items are processed in batches of 10 for efficiency
4. **Progress Tracking**: 
   - Total items count
   - Processed items count
   - Last processed item ID (checkpoint)
   - Current key version
5. **Resumability**: If interrupted, the process resumes from the last checkpoint

#### Technical Details
- **Idempotent**: Safe to retry - already-processed items are skipped
- **Version Tracking**: Each item has a `keyVersion` field
- **No Data Re-encryption**: Only DEKs are re-wrapped (old master key → new master key)
- **Progress UI**: Real-time progress display with percentage and circular indicator
- **Background Operation**: Continues even if you close the browser tab
- **Auto-resume**: On app start, checks for incomplete rotation and resumes automatically

#### Process Steps
1. Old master key decrypts each item's DEK
2. New master key re-wraps the DEK
3. Item updated with new `encryptedDek`, `dekIv`, and `keyVersion`
4. Checkpoint saved after each batch
5. When complete, rotation flag is cleared

**Note**: You cannot delete items or perform destructive actions during rotation to ensure data integrity.

### Data Schema

#### User Settings (Firestore)
```typescript
{
  salt: string;                    // Base64 encoded salt for master key derivation
  hasPassphrase: boolean;
  verifierCiphertext: string;      // Encrypted verifier for passphrase validation
  verifierIv: string;
  recoveryCodes: Array<{
    codeId: string;                // Unique identifier for the code
    salt: string;                  // Base64 salt for recovery key derivation
    wrappedMasterKey: string;      // Master key encrypted with recovery key
    iv: string;                    // IV for master key encryption
    usedAt: number | null;         // Timestamp when used, null if unused
  }>;
  keyRotation: {
    activeKeyVersion: number;      // Current master key version
    rotationInProgress: boolean;   // True during re-wrap process
    lastProcessedId: string | null; // Checkpoint for resume
    totalItems: number | null;     // Total items to process
    processedItems: number | null;  // Items processed so far
  };
  createdAt: number;
  updatedAt: number;
}
```

#### Vault Items (Firestore)
```typescript
{
  id: string;
  ownerId: string;
  parentId: string | null;
  type: 'folder' | 'text' | 'image' | 'video' | 'file';
  metadata: {
    name: string;
    size?: number;
    mimeType?: string;
    createdAt: number;
    updatedAt: number;
  };
  encryptedData?: string;          // Base64 encrypted content (for text items)
  storagePath?: string;            // Firebase Storage path (for file items)
  encryptedDek?: string;           // Base64 wrapped DEK
  iv?: string;                     // IV for data encryption
  dekIv?: string;                  // IV for DEK encryption
  keyVersion?: number;             // Master key version used to wrap DEK
}
```

## Setup

### Prerequisites

- Node.js 18+
- Firebase project with:
  - Authentication enabled (Email Link provider)
  - Firestore database
  - Storage bucket

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NovaMoonX/calypso.git
   cd calypso
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Firebase configuration:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. Deploy Firestore security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

6. Deploy Firestore indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

7. Deploy Storage security rules:
   ```bash
   firebase deploy --only storage
   ```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

### Deploy

Deploy to Firebase Hosting:
```bash
npm run build
firebase deploy
```

## Usage

### First-Time Setup

1. **Sign In**: 
   - Enter your email address
   - Click "SEND SIGN-IN LINK"
   - Check your email (and spam folder) for the magic link
   
2. **Email Verification**:
   - Click the link in your email
   - The link will open in a new tab
   - After verification, the new tab will automatically close
   - You'll be seamlessly redirected in your original tab to continue setup
   - Even if you initiated sign-in from multiple tabs, the correct tab will be redirected
   - If the original tab was closed, verification continues in the new tab
   - If needed, confirm your email in the modal dialog
   
3. **Create Passphrase** (New Users Only):
   - Choose a strong passphrase (minimum 12 characters)
   - **IMPORTANT**: Remember this passphrase - it cannot be recovered
   - Confirm your passphrase
   - Your encryption salt and passphrase verifier are automatically stored in Firestore
   - The verifier enables passphrase validation without storing the passphrase itself
   
4. **Save Recovery Codes** (New Users Only):
   - 8 unique recovery codes will be generated
   - Each code wraps your master key with a recovery-specific encryption key
   - Download them immediately (you won't see them again)
   - Store them securely (password manager, safe, etc.)
   - Each code can only be used once

### Daily Usage (Returning Users)

1. **Sign In**: Enter your email to receive a sign-in link
2. **Unlock Vault**: Enter your passphrase to decrypt your vault
   - Your encryption salt is automatically retrieved from Firestore
   - The system derives the key and validates it against the stored verifier
   - If validation fails, you'll see an "Incorrect passphrase" error
   - No need to recreate your passphrase - same one works forever
3. **Manage Items**:
   - **Create Folders**: Click "NEW FOLDER" to organize your data
   - **Add Text Notes**: Click "NEW TEXT" for encrypted text storage
   - **Upload Files**: Click "UPLOAD FILE" for images, videos, or documents
     - Select any file from your device (including custom document formats)
     - File type is automatically detected from the file's MIME type
     - View file information (name, type, size) after selection
     - Optionally rename the file before uploading
     - Maximum file size: 50MB
   - **Navigate**: Click folders to open them, use "← BACK" to go up
   - **Delete**: Hover over items and click the trash icon
4. **Sign Out**: Click "SIGN OUT" when done (redirects to login)
   - Your passphrase and master key are cleared from memory
   - Your salt remains in Firestore for next time

### Supported File Types

The vault supports uploading **any file type**, including:

**Common formats**:
- **Images**: JPEG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, OGG, QuickTime
- **Audio**: MP3
- **Documents**: PDF, TXT, MD, HTML, Word, Excel, PowerPoint, OpenDocument, RTF
- **Data**: JSON, CSV

**Custom document formats**: Files with custom extensions (e.g., `.akyl`, `.custom`) are fully supported and will be categorized as generic file types.

File types are automatically detected based on the file's MIME type when you upload. All files are encrypted with the same security standards regardless of type. Maximum file size: 50MB.

### Recovery

If you forget your passphrase:

1. **Access Recovery**: Click "Forgot your passphrase? Use a recovery code" on the passphrase screen
2. **Enter Recovery Code**: Enter one of your 8 recovery codes
3. **Verification**: The system:
   - Derives a recovery key from your code
   - Unwraps your master key
   - Verifies it against your passphrase verifier
4. **Set New Passphrase**: 
   - Choose a new strong passphrase
   - Confirm the new passphrase
5. **Automatic Re-securing**:
   - Your vault items are automatically re-secured with the new passphrase
   - Progress is displayed with a visual indicator
   - Process can be safely paused and will resume automatically
6. **New Recovery Codes**:
   - New recovery codes are generated automatically
   - Old recovery codes are invalidated
   - Download your new codes immediately

**Important**: 
- Each recovery code can only be used **once**
- After using a recovery code, it's permanently marked as used
- The re-securing process ensures all your data remains encrypted with your new passphrase
- You can safely close your browser during re-securing - it will resume when you return

### Changing Your Passphrase

You can proactively change your passphrase anytime while logged in:

1. **Access Settings**: Click "CHANGE PASSPHRASE" in the dashboard header
2. **Verify Current**: Enter your current passphrase for verification
3. **Set New Passphrase**: Enter and confirm your new passphrase
4. **Automatic Process**:
   - All vault items are re-secured with the new passphrase
   - New recovery codes are generated
   - Old recovery codes are invalidated
   - Progress is displayed in real-time
5. **Download New Codes**: Save your new recovery codes securely

**Benefits**:
- Regularly rotating your passphrase enhances security
- No data loss - all items are automatically migrated
- Resume capability if the process is interrupted

## Security Notes

⚠️ **Critical Security Information**:

### Passphrase
- Your passphrase is **never** stored or transmitted anywhere
- Without your passphrase, your data **cannot** be decrypted
- Even the app developers and Firebase administrators cannot access your data
- Choose a strong, unique passphrase (minimum 12 characters recommended)
- Consider using a passphrase manager

### Recovery Codes
- **Save them immediately** - you won't see them again after the initial setup
- Store them in a secure location (password manager, physical safe, etc.)
- Each code can only be used **once**
- Recovery codes wrap your master key using PBKDF2-derived recovery keys
- Using a recovery code validates against your passphrase verifier for security
- After recovery, you receive new codes and old ones are invalidated
- Without your passphrase OR recovery codes, your data is **permanently inaccessible**

### Data Encryption
- All encryption happens **client-side** in your browser
- Firebase only stores encrypted data, initialization vectors, and encrypted DEKs
- Each file/text has its own unique encryption key (DEK)
- DEKs are encrypted with your master key before storage
- Uses AES-256-GCM (industry-standard, military-grade encryption)
- PBKDF2 with 600,000 iterations for key derivation (OWASP 2025 standard)
- Key versioning tracks which master key version encrypted each item
- When passphrase changes, DEKs are re-wrapped (not the actual data)
- Re-wrapping process is resumable and idempotent for reliability

### Best Practices
1. Use a strong, unique passphrase
2. Download and securely store all 10 recovery codes
3. Never share your passphrase or recovery codes
4. Sign out when using shared computers
5. Keep your browser up-to-date for latest security patches
6. Use HTTPS (the app enforces this)

## Troubleshooting

### "Create folder/text not working"
**Cause**: Firebase credentials not configured
**Solution**: 
1. Create a `.env` file with your Firebase credentials (see `.env.example`)
2. Ensure Firebase Authentication is enabled in your Firebase console
3. Deploy Firestore rules: `firebase deploy --only firestore:rules`
4. Restart the dev server: `npm run dev`

### "Error 409, index already exist" when deploying indexes
**Cause**: The local indexes file is out of sync with Firebase
**Solution**:
1. Download the current indexes:
   ```bash
   firebase firestore:indexes > firestore.indexes.json
   ```
2. Redeploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

## Design & Visual Aesthetic

### Monochrome Security Aesthetic
Calypso features a unique monochrome security theme designed for a professional, terminal-inspired look:

**Color Palette**:
- **Light Mode** (default): Pure white background (`#FFFFFF`) with dark gray text (`gray-900`)
- **Dark Mode**: Pure black background (`#000000`) with light gray text (`gray-100`)
- **Accent-Free**: No blue, green, red, or other accent colors - purely grayscale
- **Monospace Font**: `ui-monospace, Menlo, Monaco, Consolas` throughout
- **True Inverse**: Dark theme is a complete inversion of light theme colors

**Design Elements**:
- **UPPERCASE Labels**: All buttons and labels use uppercase for terminal feel
- **Custom "C" Logo**: Vault door design with lock mechanism visualization
- **Card-Based Grid**: Items displayed in a responsive grid layout
- **Minimal Borders**: Subtle gray borders for clean separation
- **Toast Notifications**: Monochrome feedback for all operations
- **Modal Dialogs**: Professional overlays instead of browser prompts

**Typography**:
- All text uses monospace font for consistency
- Increased letter spacing (tracking) for readability
- Uppercase transformation for labels and buttons
- Consistent sizing hierarchy

### Theme Toggle
- Click the theme toggle button in the top-left corner
- Switches between light and dark modes
- Preference saved in browser localStorage
- **Default**: Dark mode

## Firestore Security Rules

The included `firestore.rules` implements strict security:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /vault_items/{itemId} {
      // Users can only read their own items
      allow read: if request.auth != null && request.auth.uid == resource.data.ownerId;
      
      // Users can only create items they own
      allow create: if request.auth != null && request.auth.uid == request.resource.data.ownerId;
      
      // Users can only update their own items, and cannot change ownership
      allow update: if request.auth != null 
        && request.auth.uid == resource.data.ownerId
        && request.auth.uid == request.resource.data.ownerId;
      
      // Users can only delete their own items
      allow delete: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Key Security Features**:
- ✅ Owner-only access enforcement
- ✅ Prevents ownerId modification during updates
- ✅ Requires authentication for all operations
- ✅ Denies all other database access by default

## Storage Security Rules

The included `storage.rules` restricts access to encrypted file uploads:

```javascript
rules_version = '2';

service firebase.storage {
   match /b/{bucket}/o {
      function isSignedIn() {
         return request.auth != null;
      }

      function isOwner(userId) {
         return isSignedIn() && request.auth.uid == userId;
      }

      function isValidSize() {
         return request.resource.size < 50 * 1024 * 1024;
      }

      match /vault/{userId}/{filePath=**} {
         allow read: if isOwner(userId);
         allow write: if isOwner(userId) && isValidSize();
      }

      match /{allPaths=**} {
         allow read, write: if false;
      }
   }
}
```

**Key Security Features**:
- ✅ Owner-only access to encrypted files
- ✅ 50MB file size enforcement at the rules layer
- ✅ Deny-all fallback for any non-vault paths

## Data Schema

### Vault Item Structure

Each item in Firestore follows this schema:

```typescript
interface VaultItem {
  id: string;                    // Firestore document ID
  ownerId: string;               // Firebase Auth UID (immutable after creation)
  parentId: string | null;       // Parent folder ID (null = root level)
  type: 'folder' | 'text' | 'image' | 'video' | 'file';
  
  metadata: {
    name: string;                // Item name (not encrypted for navigation)
    size?: number;               // File size in bytes (for files only)
    mimeType?: string;           // MIME type (for files only)
    createdAt: number;           // Unix timestamp
    updatedAt: number;           // Unix timestamp
  };
  
  // Encryption fields (not present for folders)
  encryptedData?: string;        // Base64-encoded encrypted content (text items)
  storagePath?: string;          // Firebase Storage path (file items)
  encryptedDek: string;          // Encrypted Data Encryption Key
  iv: string;                    // Initialization Vector for data encryption
  dekIv: string;                 // IV for DEK encryption
}
```

### Storage Structure

- **Firestore**: 
  - `vault_items`: Stores metadata, encrypted DEKs, and encrypted text content
  - `recovery_codes`: Stores hashed recovery codes
  - `user_settings`: Stores salt and passphrase verifier for each user
- **Firebase Storage**: Stores encrypted file binaries at paths like `vault/{ownerId}/{timestamp}_{filename}`

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Icons.tsx       # Custom SVG icons
│   └── Logo.tsx        # Calypso logo component
├── contexts/           # React Context providers
│   ├── AuthProvider.tsx    # Authentication & master key management
│   └── VaultProvider.tsx   # Vault state & CRUD operations
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Auth context hook
│   └── useVault.tsx    # Vault context hook
├── lib/                # Utilities and configuration
│   ├── firebase/
│   │   └── FirebaseConfig.ts
│   └── types/
│       └── vault.types.ts
├── screens/            # Page components
│   ├── Login.tsx
│   ├── AuthVerify.tsx
│   ├── PassphraseSetup.tsx
│   ├── RecoveryCodes.tsx
│   └── Dashboard.tsx
├── services/           # Business logic
│   ├── EncryptionService.ts       # AES-256-GCM encryption with verifier support
│   ├── RecoveryCodesService.ts    # Recovery code management
│   └── UserSettingsService.ts     # User settings (salt, verifier) management
├── routes/             # Router configuration
└── ui/                 # Layout components
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
