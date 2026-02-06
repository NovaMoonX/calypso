import { useState, useEffect } from 'react';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { Textarea } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useVault } from '@hooks/useVault';
import { useAuth } from '@hooks/useAuth';
import { VaultItem } from '@lib/types/vault.types';
import { Plus, ChevronLeft, Trash } from '@moondreamsdev/dreamer-ui/symbols';
import { FolderIcon, FileTextIcon, ImageIcon, VideoIcon, FileIcon } from '@components/Icons';
import { CalypsoLogoWithText } from '@components/Logo';
import { FileUploadModal } from '@components/FileUploadModal';
import { KeyRotationProgress } from '@components/KeyRotationProgress';
import { KeyRotationService, KeyRotationProgress as KeyRotationProgressType } from '@/services/KeyRotationService';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const { addToast } = useToast();
  const {
    items,
    currentPath,
    currentFolderId,
    loading,
    navigateToFolder,
    navigateBack,
    createFolder,
    createTextItem,
    deleteItem,
  } = useVault();

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewTextModal, setShowNewTextModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newTextName, setNewTextName] = useState('');
  const [newTextContent, setNewTextContent] = useState('');
  const [rotationProgress, setRotationProgress] = useState<KeyRotationProgressType | null>(null);

  // Check for key rotation progress
  useEffect(() => {
    const checkRotationProgress = async () => {
      if (!user) return;

      const progress = await KeyRotationService.getRotationProgress(user.uid);
      if (!progress.isComplete) {
        setRotationProgress(progress);
        
        // Poll for updates every 3 seconds
        const interval = setInterval(async () => {
          const updatedProgress = await KeyRotationService.getRotationProgress(user.uid);
          setRotationProgress(updatedProgress);
          
          if (updatedProgress.isComplete) {
            clearInterval(interval);
          }
        }, 3000);

        return () => clearInterval(interval);
      }
    };

    checkRotationProgress();
  }, [user]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await createFolder(newFolderName);
      setNewFolderName('');
      setShowNewFolderModal(false);
      addToast({ title: 'Success', description: 'Folder created successfully' });
    } catch (error) {
      console.error('Error creating folder:', error);
      addToast({ 
        title: 'Error', 
        description: 'Failed to create folder', 
        type: 'error' 
      });
    }
  };

  const handleCreateText = async () => {
    if (!newTextName.trim() || !newTextContent.trim()) return;

    try {
      await createTextItem(newTextName, newTextContent);
      setNewTextName('');
      setNewTextContent('');
      setShowNewTextModal(false);
      addToast({ title: 'Success', description: 'Text item created successfully' });
    } catch (error) {
      console.error('Error creating text:', error);
      addToast({ 
        title: 'Error', 
        description: 'Failed to create text item', 
        type: 'error' 
      });
    }
  };

  const handleDelete = async (itemId: string, itemName: string) => {
    // Using native confirm for now - could be replaced with custom modal
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    try {
      await deleteItem(itemId);
      addToast({ title: 'Success', description: 'Item deleted successfully' });
    } catch (error) {
      console.error('Error deleting item:', error);
      addToast({ 
        title: 'Error', 
        description: 'Failed to delete item', 
        type: 'error' 
      });
    }
  };

  const getItemIcon = (item: VaultItem) => {
    switch (item.type) {
      case 'folder':
        return <FolderIcon className="w-12 h-12" />;
      case 'text':
        return <FileTextIcon className="w-12 h-12" />;
      case 'image':
        return <ImageIcon className="w-12 h-12" />;
      case 'video':
        return <VideoIcon className="w-12 h-12" />;
      case 'file':
        return <FileIcon className="w-12 h-12" />;
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    const result = `${size.toFixed(1)} ${units[unitIndex]}`;
    return result;
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

      {/* Navigation */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2">
          {currentFolderId && (
            <Button
              variant="secondary"
              onClick={navigateBack}
              className="flex items-center gap-2 font-mono text-xs tracking-wider"
            >
              <ChevronLeft size={16} />
              BACK
            </Button>
          )}
          <span className="text-xs text-foreground/70 font-mono">{currentPath.join(' / ')}</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Key Rotation Progress */}
        {rotationProgress && !rotationProgress.isComplete && (
          <div className="mb-6">
            <KeyRotationProgress
              totalItems={rotationProgress.totalItems}
              processedItems={rotationProgress.processedItems}
              percentComplete={rotationProgress.percentComplete}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Button 
            variant="primary" 
            onClick={() => setShowNewFolderModal(true)} 
            className="font-mono text-xs tracking-wider"
            disabled={rotationProgress && !rotationProgress.isComplete}
          >
            <Plus size={16} className="mr-2" />
            NEW FOLDER
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowNewTextModal(true)} 
            className="font-mono text-xs tracking-wider"
            disabled={rotationProgress && !rotationProgress.isComplete}
          >
            <Plus size={16} className="mr-2" />
            NEW TEXT
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowUploadModal(true)} 
            className="font-mono text-xs tracking-wider"
            disabled={rotationProgress && !rotationProgress.isComplete}
          >
            <Plus size={16} className="mr-2" />
            UPLOAD FILE
          </Button>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-foreground/70">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/70">No items in this folder</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.type === 'folder') {
                    navigateToFolder(item.id);
                  }
                }}
                className="cursor-pointer"
              >
                <Card
                  className={join(
                    'relative group hover:border-primary transition-colors',
                    item.type === 'folder' ? 'bg-card/50' : 'bg-card'
                  )}
                >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-center text-foreground/70">
                    {getItemIcon(item)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-mono truncate uppercase tracking-wider" title={item.metadata.name}>
                      {item.metadata.name}
                    </p>
                    {item.metadata.size && (
                      <p className="text-xs text-foreground/50 font-mono">
                        {formatFileSize(item.metadata.size)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id, item.metadata.name);
                  }}
                  className={join(
                    'absolute top-2 right-2 p-2 rounded-md',
                    'bg-destructive/10 text-destructive',
                    'opacity-0 group-hover:opacity-100 transition-opacity',
                    'hover:bg-destructive/20'
                  )}
                  title="Delete"
                >
                  <Trash size={16} />
                </button>
              </Card>
            </div>
            ))}
          </div>
        )}
      </main>

      {/* New Folder Modal */}
      <Modal
        isOpen={showNewFolderModal}
        onClose={() => setShowNewFolderModal(false)}
        title="Create New Folder"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Folder Name</label>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowNewFolderModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateFolder}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* New Text Modal */}
      <Modal
        isOpen={showNewTextModal}
        onClose={() => setShowNewTextModal(false)}
        title="Create New Text"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              value={newTextName}
              onChange={(e) => setNewTextName(e.target.value)}
              placeholder="Enter text name"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={newTextContent}
              onChange={(e) => setNewTextContent(e.target.value)}
              placeholder="Enter your text here..."
              rows={10}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowNewTextModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateText}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload File Modal */}
      <FileUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
}

export default Dashboard;
