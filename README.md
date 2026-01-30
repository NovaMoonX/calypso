# Calypso

A zero-knowledge encrypted storage vault for securely storing sensitive digital material (notes, images, videos, files).

## Features

### Security & Encryption
- 🔐 **Zero-Knowledge Encryption**: All data is encrypted on the client-side before being sent to Firebase
- 🔑 **AES-256-GCM Encryption**: Military-grade encryption using Web Crypto API
- 🔒 **PBKDF2 Key Derivation**: 600,000 iterations (OWASP 2025 standard)
- 🎫 **Recovery Codes**: 10 single-use recovery codes for account recovery
- 🛡️ **Timing Attack Protection**: Constant-time comparisons for security-critical operations
- 📦 **Per-Item Encryption**: Each item has a unique Data Encryption Key (DEK)

### Authentication & Access
- 📧 **Passwordless Authentication**: Firebase Email Link authentication
- ✉️ **Smart Email Hints**: Spam folder reminder for better user experience
- 🔐 **Passphrase Protection**: Minimum 12-character passphrase requirement
- 🚪 **Auto Sign-Out Redirect**: Secure redirect to login on sign-out

### Data Management
- 📁 **Nested Folders**: Organize your encrypted data with unlimited folder hierarchy
- 📝 **Multiple File Types**: Store text, images, videos, and files (50MB max per file)
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
2. **Data Encryption Keys (DEK)**: Each item (text/file) has a unique randomly generated 256-bit DEK
3. **Key Wrapping**: DEKs are encrypted with the master key before storage in Firestore
4. **Client-Side Only**: All encryption/decryption happens in your browser. Firebase only stores encrypted data
5. **No Passphrase Storage**: Your passphrase is never stored or transmitted - it exists only in memory during your session

### Security Features

- **Constant-Time Comparisons**: Recovery code validation uses timing-attack-resistant comparisons
- **Rejection Sampling**: Cryptographically secure random code generation with uniform distribution
- **Atomic Operations**: Recovery code validation and consumption happen atomically to prevent race conditions
- **Owner Verification**: Firestore security rules prevent ownerId modification and enforce strict access control
- **SHA-256 Hashing**: Recovery codes are hashed before storage
- **Secure Session Management**: Master key held in memory only, cleared on sign-out

### Data Flow

1. User provides passphrase → Master Key derived (never stored)
2. Item created → Random DEK generated
3. Item encrypted with DEK → DEK encrypted with Master Key
4. Encrypted item + Encrypted DEK stored in Firebase
5. To decrypt: Retrieve from Firebase → Decrypt DEK with Master Key → Decrypt item with DEK

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
   - If needed, confirm your email in the modal dialog
   
3. **Create Passphrase**:
   - Choose a strong passphrase (minimum 12 characters)
   - **IMPORTANT**: Remember this passphrase - it cannot be recovered
   - Confirm your passphrase
   
4. **Save Recovery Codes**:
   - 10 unique recovery codes will be generated
   - Download them immediately (you won't see them again)
   - Store them securely (password manager, safe, etc.)
   - Each code can only be used once

### Daily Usage

1. **Sign In**: Enter your email to receive a sign-in link
2. **Unlock Vault**: Enter your passphrase to decrypt your vault
3. **Manage Items**:
   - **Create Folders**: Click "NEW FOLDER" to organize your data
   - **Add Text Notes**: Click "NEW TEXT" for encrypted text storage
   - **Upload Files**: Click "UPLOAD FILE" for images, videos, or documents
   - **Navigate**: Click folders to open them, use "← BACK" to go up
   - **Delete**: Hover over items and click the trash icon
4. **Sign Out**: Click "SIGN OUT" when done (redirects to login)

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

### Demo Mode
The app includes fallback Firebase configuration for UI testing. However, **all functionality requires valid Firebase credentials**:
- Authentication will not work without proper API keys
- Folder/file creation requires Firestore access
- File uploads require Firebase Storage

To enable full functionality, configure your Firebase project credentials in `.env`.

## UI Design & Theme

### Monochrome Security Aesthetic
Calypso features a unique monochrome security theme designed for a professional, terminal-inspired look:

**Color Palette**:
- **Dark Mode** (default): Pure black background (`#000000`) with light gray text (`gray-100`)
- **Light Mode**: Pure white background (`#FFFFFF`) with dark gray text (`gray-900`)
- **Accent-Free**: No blue, green, red, or other accent colors - purely grayscale
- **Monospace Font**: `ui-monospace, Menlo, Monaco, Consolas` throughout
- **True Inverse**: Light theme is a complete inversion of dark theme colors

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
- Switches between dark and light modes
- Preference saved in browser localStorage

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

- **Firestore**: Stores metadata, encrypted DEKs, and encrypted text content
- **Firebase Storage**: Stores encrypted file binaries at paths like `encrypted_files/{ownerId}/{itemId}`
- **localStorage**: Stores salt (per user), recovery code hashes (per user)

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
│   ├── EncryptionService.ts    # AES-256-GCM encryption
│   └── RecoveryCodesService.ts # Recovery code management
├── routes/             # Router configuration
└── ui/                 # Layout components
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
