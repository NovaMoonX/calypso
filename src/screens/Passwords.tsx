import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { usePasswords } from '@hooks/usePasswords';
import { useAuth } from '@hooks/useAuth';
import { PasswordItem, PasswordItemData } from '@lib/types/vault.types';
import { Plus, Trash, Copy } from '@moondreamsdev/dreamer-ui/symbols';
import { KeyIcon, EyeIcon, EyeOffIcon, EditIcon } from '@components/Icons';
import { CalypsoLogoWithText } from '@components/Logo';

export default function Passwords() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { addToast } = useToast();
  const {
    passwords,
    loading,
    createPassword,
    updatePassword,
    deletePassword,
    getDecryptedPassword,
  } = usePasswords();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPassword, setSelectedPassword] = useState<PasswordItem | null>(null);
  const [decryptedData, setDecryptedData] = useState<PasswordItemData | null>(null);

  // Form state for create/edit
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);

  const resetForm = () => {
    setFormName('');
    setFormTitle('');
    setFormUsername('');
    setFormPassword('');
    setFormNotes('');
    setShowPasswordField(false);
  };

  const handleCreate = async () => {
    if (!formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      addToast({
        title: 'Validation Error',
        description: 'Name, username, and password are required',
        type: 'error',
      });
      return;
    }

    try {
      const passwordData: PasswordItemData = {
        title: formTitle.trim() || undefined,
        username: formUsername.trim(),
        password: formPassword.trim(),
        notes: formNotes.trim() || undefined,
      };

      await createPassword(formName.trim(), passwordData);
      resetForm();
      setShowCreateModal(false);
      addToast({ title: 'Success', description: 'Password created successfully' });
    } catch (error) {
      console.error('Error creating password:', error);
      addToast({
        title: 'Error',
        description: 'Failed to create password',
        type: 'error',
      });
    }
  };

  const handleEdit = async () => {
    if (!selectedPassword || !formName.trim() || !formUsername.trim() || !formPassword.trim()) {
      addToast({
        title: 'Validation Error',
        description: 'Name, username, and password are required',
        type: 'error',
      });
      return;
    }

    try {
      const passwordData: PasswordItemData = {
        title: formTitle.trim() || undefined,
        username: formUsername.trim(),
        password: formPassword.trim(),
        notes: formNotes.trim() || undefined,
      };

      await updatePassword(selectedPassword.id, formName.trim(), passwordData);
      resetForm();
      setShowEditModal(false);
      setSelectedPassword(null);
      addToast({ title: 'Success', description: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      addToast({
        title: 'Error',
        description: 'Failed to update password',
        type: 'error',
      });
    }
  };

  const handleView = async (password: PasswordItem) => {
    try {
      const data = await getDecryptedPassword(password.id);
      setSelectedPassword(password);
      setDecryptedData(data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Error viewing password:', error);
      addToast({
        title: 'Error',
        description: 'Failed to decrypt password',
        type: 'error',
      });
    }
  };

  const handleEditClick = async (password: PasswordItem) => {
    try {
      const data = await getDecryptedPassword(password.id);
      setSelectedPassword(password);
      setFormName(password.metadata.name);
      setFormTitle(data.title || '');
      setFormUsername(data.username);
      setFormPassword(data.password);
      setFormNotes(data.notes || '');
      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading password for edit:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load password',
        type: 'error',
      });
    }
  };

  const handleDelete = async (passwordId: string, passwordName: string) => {
    if (!confirm(`Are you sure you want to delete "${passwordName}"?`)) {
      return;
    }

    try {
      await deletePassword(passwordId);
      addToast({ title: 'Success', description: 'Password deleted successfully' });
    } catch (error) {
      console.error('Error deleting password:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete password',
        type: 'error',
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      addToast({ title: 'Copied', description: `${label} copied to clipboard` });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      addToast({
        title: 'Error',
        description: 'Failed to copy to clipboard',
        type: 'error',
      });
    }
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedPassword(null);
    setDecryptedData(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedPassword(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background font-mono">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <CalypsoLogoWithText size={32} />
          <div className="flex items-center gap-4">
            <span className="text-xs text-foreground/70">{user?.email}</span>
            <Button variant="secondary" onClick={signOut} className="font-mono text-xs tracking-wider">
              SIGN OUT
            </Button>
          </div>
        </div>
      </header>

      {/* Section Navigation */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-0">
          <div className="flex gap-0">
            <button
              onClick={() => navigate('/dashboard')}
              className={join(
                'px-6 py-3 font-mono text-xs tracking-wider uppercase transition-colors border-b-2',
                'border-transparent text-foreground/70 hover:text-foreground hover:border-foreground/30'
              )}
            >
              FILES
            </button>
            <button
              className={join(
                'px-6 py-3 font-mono text-xs tracking-wider uppercase transition-colors border-b-2',
                'border-primary text-primary'
              )}
            >
              PASSWORDS
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-mono tracking-wider uppercase">Passwords</h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="font-mono text-xs tracking-wider"
          >
            <Plus size={16} className="mr-2" />
            NEW PASSWORD
          </Button>
        </div>

        {/* Passwords Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/70">Loading...</p>
          </div>
        ) : passwords.length === 0 ? (
          <div className="text-center py-12">
            <KeyIcon className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
            <p className="text-foreground/70 mb-2">No passwords stored yet</p>
            <p className="text-foreground/50 text-sm">Click "NEW PASSWORD" to add your first password</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {passwords.map((password) => (
              <div
                key={password.id}
                onClick={() => handleView(password)}
                className="cursor-pointer"
              >
                <Card className="relative group hover:border-primary transition-colors">
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-center text-foreground/70">
                      <KeyIcon className="w-12 h-12" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-mono truncate uppercase tracking-wider" title={password.metadata.name}>
                        {password.metadata.name}
                      </p>
                      <p className="text-xs text-foreground/50 font-mono">
                        {new Date(password.metadata.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div
                    className={join(
                      'absolute top-2 right-2 flex gap-1',
                      'opacity-0 group-hover:opacity-100 transition-opacity'
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(password);
                      }}
                      className={join(
                        'p-2 rounded-md',
                        'bg-primary/10 text-primary',
                        'hover:bg-primary/20'
                      )}
                      title="Edit"
                    >
                      <EditIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(password.id, password.metadata.name);
                      }}
                      className={join(
                        'p-2 rounded-md',
                        'bg-destructive/10 text-destructive',
                        'hover:bg-destructive/20'
                      )}
                      title="Delete"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Password Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="NEW PASSWORD"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Name *
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Gmail, GitHub, etc."
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Title (Optional)
            </label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Additional description"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Username *
            </label>
            <Input
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              placeholder="Email or username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Password *
            </label>
            <div className="relative">
              <Input
                type={showPasswordField ? 'text' : 'password'}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
              />
              <button
                onClick={() => setShowPasswordField(!showPasswordField)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                type="button"
              >
                {showPasswordField ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Notes (Optional)
            </label>
            <Textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Additional notes or security questions"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="primary"
              onClick={handleCreate}
              className="flex-1 font-mono text-xs tracking-wider"
            >
              CREATE
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="flex-1 font-mono text-xs tracking-wider"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Password Modal */}
      <Modal isOpen={showViewModal} onClose={closeViewModal} title={selectedPassword?.metadata.name.toUpperCase() || 'PASSWORD'}>
        {decryptedData && (
          <div className="space-y-4">
            {decryptedData.title && (
              <div>
                <label className="block text-xs font-mono tracking-wider mb-2 uppercase text-foreground/70">
                  Title
                </label>
                <p className="text-sm font-mono">{decryptedData.title}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono tracking-wider mb-2 uppercase text-foreground/70">
                Username
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono flex-1">{decryptedData.username}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(decryptedData.username, 'Username')}
                  className="font-mono text-xs tracking-wider"
                >
                  <Copy size={14} className="mr-1" />
                  COPY
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono tracking-wider mb-2 uppercase text-foreground/70">
                Password
              </label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono flex-1 break-all">{decryptedData.password}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(decryptedData.password, 'Password')}
                  className="font-mono text-xs tracking-wider"
                >
                  <Copy size={14} className="mr-1" />
                  COPY
                </Button>
              </div>
            </div>

            {decryptedData.notes && (
              <div>
                <label className="block text-xs font-mono tracking-wider mb-2 uppercase text-foreground/70">
                  Notes
                </label>
                <p className="text-sm font-mono whitespace-pre-wrap">{decryptedData.notes}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                variant="secondary"
                onClick={closeViewModal}
                className="w-full font-mono text-xs tracking-wider"
              >
                CLOSE
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Password Modal */}
      <Modal isOpen={showEditModal} onClose={closeEditModal} title="EDIT PASSWORD">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Name *
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Gmail, GitHub, etc."
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Title (Optional)
            </label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Additional description"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Username *
            </label>
            <Input
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              placeholder="Email or username"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Password *
            </label>
            <div className="relative">
              <Input
                type={showPasswordField ? 'text' : 'password'}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="new-password"
              />
              <button
                onClick={() => setShowPasswordField(!showPasswordField)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground"
                type="button"
              >
                {showPasswordField ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono tracking-wider mb-2 uppercase">
              Notes (Optional)
            </label>
            <Textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="Additional notes or security questions"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="primary"
              onClick={handleEdit}
              className="flex-1 font-mono text-xs tracking-wider"
            >
              SAVE
            </Button>
            <Button
              variant="secondary"
              onClick={closeEditModal}
              className="flex-1 font-mono text-xs tracking-wider"
            >
              CANCEL
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
