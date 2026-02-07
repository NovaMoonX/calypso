# Calypso

A zero-knowledge encrypted storage vault for securely storing sensitive digital material (notes, images, videos, files).

## Features

### Security & Encryption
- 🔐 **Zero-Knowledge Encryption**: All data is encrypted on the client-side before being sent to Firebase
- 🔑 **AES-256-GCM Encryption**: Military-grade encryption using Web Crypto API
- 🔒 **PBKDF2 Key Derivation**: 600,000 iterations (OWASP 2025 standard)
- 🎫 **Recovery Codes**: 10 single-use recovery codes stored in Firestore with SHA-256 hashing
- 🛡️ **Timing Attack Protection**: Constant-time comparisons for security-critical operations
- 📦 **Per-Item Encryption**: Each item has a unique Data Encryption Key (DEK)
- ☁️ **Cloud Salt Storage**: Encryption salt stored securely in Firestore for seamless re-authentication
- 🔓 **JIT Blob Decryption**: Just-In-Time decryption creates temporary in-memory Blob URLs for secure file viewing
- 🧹 **Automatic Memory Cleanup**: Decrypted data automatically cleared when viewer closes

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
- 👁️ **In-House Secure Viewer**: Built-in viewer for images, PDFs, videos, audio, and text files
- 🔒 **Browser-Only Decryption**: Files decrypted and viewed entirely in browser memory (no third-party services)

### User Interface
- 🌑 **Monochrome Security Theme**: Pure grayscale design (black, gray, white)
- 🖥️ **Monospace Typography**: Terminal-inspired aesthetic with UPPERCASE labels
- 🎨 **Light/Dark Theme Support**: Switch between themes seamlessly
- 🔰 **Custom "C" Logo**: Secure vault door design
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎯 **Modal-Based Flows**: Professional UI components instead of browser prompts
- 📄 **Why Use Page**: Comprehensive explanation of benefits for non-technical users with theme-aware SVG illustrations

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
- **Constant-Time Comparisons**: Recovery code validation uses timing-attack-resistant comparisons
- **Rejection Sampling**: Cryptographically secure random code generation with uniform distribution
- **Atomic Operations**: Recovery code validation and consumption happen atomically to prevent race conditions
- **Owner Verification**: Firestore security rules prevent ownerId modification and enforce strict access control
- **Storage Access Control**: Storage rules restrict file access to owners and enforce the 50MB limit
- **SHA-256 Hashing**: Recovery codes are hashed before storage in Firestore
- **Secure Session Management**: Master key held in memory only, cleared on sign-out
- **Cloud Salt Storage**: Salt stored in Firestore with strict access control (user can only access their own)
- **One-Time Passphrase Setup**: Set your passphrase once; returning users simply enter it to unlock their vault
- **No Direct Passphrase Storage**: Passphrase correctness verified by decrypting a known verifier, not by comparing stored values

### Data Flow

1. User provides passphrase → Master Key derived (never stored)
2. Item created → Random DEK generated
3. Item encrypted with DEK → DEK encrypted with Master Key
4. Encrypted item + Encrypted DEK stored in Firebase
5. To decrypt: Retrieve from Firebase → Decrypt DEK with Master Key → Decrypt item with DEK

### Secure File Viewer (JIT Blob Decryption)

Calypso implements a custom in-house viewer using the **Just-In-Time (JIT) Blob Decryption** pattern, ensuring that your files are never sent to third-party cloud viewers in plaintext.

#### How It Works

1. **Download**: Encrypted file fetched from Firebase Storage as ArrayBuffer
2. **Decrypt**: File decrypted in-browser using your master key and the file's unique DEK
3. **Blobify**: Temporary Blob URL created via `URL.createObjectURL()` (exists only in browser memory)
4. **Display**: File rendered using native HTML5 elements:
   - **Images**: `<img>` tag with blob URL
   - **PDFs**: `<iframe>` with sandbox security attributes
   - **Videos**: `<video>` tag with native controls
   - **Audio**: `<audio>` tag with custom player UI
   - **Text**: Pre-formatted text display
   - **Other Files**: Download-only option

#### Security Measures

- **Memory Sanitization**: Blob URLs automatically revoked when viewer closes
- **No Persistent Cache**: Decrypted data never written to disk
- **Sandboxed PDFs**: PDF viewer uses `<iframe sandbox>` to prevent malicious scripts
- **Size Limit**: Current implementation optimized for files under 50MB
- **Auto-Cleanup**: React cleanup hooks ensure memory is freed on component unmount
- **Browser-Only**: All decryption happens client-side; no data sent to external services

#### Supported File Types

| File Type | View Method | Component |
|-----------|-------------|-----------|
| Images (JPG, PNG, GIF, etc.) | Direct display | Modal (fullscreen) |
| PDFs | Sandboxed iframe | Modal (fullscreen) |
| Videos (MP4, WebM, etc.) | HTML5 video player | Modal (dark mode) |
| Audio (MP3, WAV, etc.) | HTML5 audio player | Card (floating player) |
| Text (TXT, MD, etc.) | Pre-formatted text | Card |
| Other Files | Download-only | Download button |

#### Future Enhancements

For files larger than 50MB, streaming decryption via the Web Streams API can be implemented:
- Files fetched in chunks (e.g., 1MB at a time)
- Each chunk decrypted on-the-fly
- Streamed to `MediaSource` for large video/audio playback

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

### Security Headers (Recommended)

For enhanced security, configure your hosting provider to send the following HTTP headers:

**Content Security Policy (CSP)**:
```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' blob: data:; 
  media-src 'self' blob:; 
  connect-src 'self' https://*.firebaseio.com https://*.googleapis.com; 
  object-src 'none'; 
  frame-ancestors 'none'; 
  base-uri 'self';
```

**Additional Security Headers**:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

For Firebase Hosting, add these to `firebase.json`:
```json
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self';"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  }
}
```

These headers help prevent:
- **XSS attacks**: CSP restricts script sources
- **Clickjacking**: X-Frame-Options prevents embedding
- **MIME sniffing**: X-Content-Type-Options enforces correct MIME types
- **Data leaks**: Referrer-Policy controls referrer information
- **Blob URL sniffing**: CSP allows blob: sources only for img and media

## Usage

### Exploring the App

Before signing up, you can learn about Calypso's benefits:

- **Why Use Page** (`/why-use`): A comprehensive, user-friendly page explaining why you should choose Calypso over traditional cloud storage
  - Benefits include true privacy, simplicity, user control, and no vendor lock-in
  - Side-by-side comparison with traditional cloud providers
  - Use case examples for personal documents, creative work, and family memories
  - Theme-aware SVG illustrations that adapt to light/dark mode
  - Accessible from the login page via the "WHY USE?" link in the upper left

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
   - 10 unique recovery codes will be generated
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
1. Use one of your recovery codes during the passphrase setup step
2. Each recovery code can only be used once
3. After using a code, it's permanently invalidated

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
- Without your passphrase OR recovery codes, your data is **permanently inaccessible**
- Recovery codes bypass your passphrase for account recovery

### Data Encryption
- All encryption happens **client-side** in your browser
- Firebase only stores encrypted data, initialization vectors, and encrypted DEKs
- Each file/text has its own unique encryption key (DEK)
- DEKs are encrypted with your master key before storage
- Uses AES-256-GCM (industry-standard, military-grade encryption)
- PBKDF2 with 600,000 iterations for key derivation (OWASP 2025 standard)

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
│   ├── FileUploadModal.tsx      # File upload UI
│   ├── Icons.tsx                # Custom SVG icons
│   ├── Logo.tsx                 # Calypso logo component
│   ├── SecureFileViewer.tsx     # JIT blob decryption file viewer
│   └── ...
├── contexts/           # React Context providers
│   ├── AuthProvider.tsx    # Authentication & master key management
│   ├── VaultProvider.tsx   # Vault state & CRUD operations
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx            # Auth context hook
│   ├── useSecureFileViewer.tsx # Secure file viewing with blob management
│   ├── useVault.tsx           # Vault context hook
│   └── ...
├── lib/                # Utilities and configuration
│   ├── firebase/
│   │   └── FirebaseConfig.ts
│   ├── types/
│   │   └── vault.types.ts
│   └── utils/
│       └── fileUtils.ts       # File type detection utilities
├── screens/            # Page components
│   ├── Login.tsx
│   ├── AuthVerify.tsx
│   ├── PassphraseSetup.tsx
│   ├── RecoveryCodes.tsx
│   ├── Dashboard.tsx
│   └── ...
├── services/           # Business logic
│   ├── EncryptionService.ts       # AES-256-GCM encryption with verifier support
│   ├── RecoveryCodesService.ts    # Recovery code management
│   └── UserSettingsService.ts     # User settings (salt, verifier) management
├── utils/              # Utility functions
│   └── blobUtils.ts           # Blob URL creation/revocation utilities
├── routes/             # Router configuration
└── ui/                 # Layout components
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
