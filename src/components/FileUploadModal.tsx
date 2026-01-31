import { useState } from 'react';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { Input } from '@moondreamsdev/dreamer-ui/components';
import { useToast } from '@moondreamsdev/dreamer-ui/hooks';
import { useVault } from '@hooks/useVault';
import { detectFileType, getFileTypeLabel } from '@lib/utils/fileUtils';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const { uploadFile } = useVault();
  const { addToast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customFileName, setCustomFileName] = useState('');

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

  const getFileExtension = (fileName: string): string => {
    const extensionMatch = fileName.match(/\.[^.]+$/);
    return extensionMatch ? extensionMatch[0] : '';
  };

  const resetUploadModal = () => {
    setSelectedFile(null);
    setCustomFileName('');
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      // Preserve file extension when custom name is provided
      let fileName = customFileName.trim();
      if (fileName) {
        // Extract extension from original filename
        const extension = getFileExtension(selectedFile.name);
        
        // Add extension if not already present in custom name
        if (extension && !fileName.endsWith(extension)) {
          fileName += extension;
        }
      } else {
        // Use original filename if no custom name provided
        fileName = selectedFile.name;
      }
      
      await uploadFile(selectedFile, fileName);
      resetUploadModal();
      addToast({ title: 'Success', description: 'File uploaded successfully' });
    } catch (error) {
      console.error('Error uploading file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      addToast({ 
        title: 'Error', 
        description: errorMessage, 
        type: 'error' 
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetUploadModal}
      title="Upload File"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select File</label>
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setSelectedFile(file);
              setCustomFileName('');
            }}
            className={join(
              'w-full px-3 py-2 rounded-md',
              'bg-background border border-border',
              'text-foreground text-sm',
              'file:mr-4 file:py-1 file:px-3',
              'file:rounded-md file:border-0',
              'file:text-sm file:font-medium',
              'file:bg-primary file:text-primary-foreground',
              'file:cursor-pointer'
            )}
          />
        </div>
        
        {selectedFile && (
          <>
            <div className="space-y-2 p-3 bg-background/50 rounded-md border border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground/70">FILE INFO</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-mono">
                  <span className="text-foreground/70">Name: </span>
                  <span className="text-foreground">{selectedFile.name}</span>
                </p>
                <p className="text-sm font-mono">
                  <span className="text-foreground/70">Type: </span>
                  <span className="text-foreground">{getFileTypeLabel(detectFileType(selectedFile.type))}</span>
                </p>
                <p className="text-sm font-mono">
                  <span className="text-foreground/70">Size: </span>
                  <span className="text-foreground">{formatFileSize(selectedFile.size)}</span>
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Name (Optional)</label>
              <Input
                value={customFileName}
                onChange={(e) => setCustomFileName(e.target.value)}
                placeholder="Enter custom name (extension will be preserved)"
              />
              {customFileName.trim() ? (
                <p className="text-xs text-foreground/50">
                  Will be saved as: <span className="font-medium text-foreground">{customFileName.trim()}{(() => {
                    const extension = getFileExtension(selectedFile.name);
                    return !customFileName.trim().endsWith(extension) ? extension : '';
                  })()}</span>
                </p>
              ) : (
                <p className="text-xs text-foreground/50">
                  Leave empty to keep original name. File extension will be automatically preserved.
                </p>
              )}
            </div>
          </>
        )}
        
        <div className="flex justify-end gap-2">
          <Button 
            variant="secondary" 
            onClick={resetUploadModal}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpload} disabled={!selectedFile}>
            Upload
          </Button>
        </div>
      </div>
    </Modal>
  );
}
