# Calypso

A zero-knowledge encrypted storage vault for securely storing sensitive digital material (notes, images, videos, files).

## Features

- 🔐 **Zero-Knowledge Encryption**: All data is encrypted on the client-side before being sent to Firebase
- 🔑 **AES-256-GCM Encryption**: Military-grade encryption using Web Crypto API
- 📧 **Passwordless Authentication**: Firebase Email Link authentication
- 📁 **Nested Folders**: Organize your encrypted data with folders
- 📝 **Multiple File Types**: Store text, images, videos, and files
- 🌙 **Dark Minimalist UI**: Clean, modern interface with Dreamer UI components

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **UI Library**: [Dreamer UI](https://www.npmjs.com/package/@moondreamsdev/dreamer-ui)
- **Backend**: Google Firebase (Authentication, Firestore, Storage)
- **Encryption**: Web Crypto API with AES-256-GCM

## Security Architecture

### Zero-Knowledge Encryption

1. **Master Key Derivation**: When you create your vault, a master key is derived from your passphrase using PBKDF2 (100,000 iterations)
2. **Data Encryption Keys (DEK)**: Each item (text/file) has a unique randomly generated DEK
3. **Key Wrapping**: DEKs are encrypted with the master key before storage
4. **Client-Side Only**: All encryption/decryption happens in your browser. Firebase only stores encrypted data

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

1. **Sign In**: Enter your email to receive a sign-in link
2. **Create Vault**: On first sign-in, create a strong passphrase (minimum 12 characters)
3. **Unlock Vault**: On subsequent visits, enter your passphrase to unlock
4. **Manage Items**:
   - Create folders to organize your data
   - Add encrypted text notes
   - Upload encrypted images, videos, and files
   - Navigate through folders with the back button
   - Delete items as needed

## Security Notes

⚠️ **Important**:
- Your passphrase is **never** stored or transmitted
- Without your passphrase, your data **cannot** be decrypted
- Make sure to remember your passphrase or store it securely
- Even Firebase administrators cannot access your encrypted data

## Firestore Rules

The included `firestore.rules` ensures:
- Users can only access their own vault items
- All operations require authentication
- Owner verification on all read/write operations

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
