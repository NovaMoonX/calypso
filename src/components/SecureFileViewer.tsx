import { useEffect, useState } from 'react';
import { join } from '@moondreamsdev/dreamer-ui/utils';
import { Modal } from '@moondreamsdev/dreamer-ui/components';
import { Card } from '@moondreamsdev/dreamer-ui/components';
import { Button } from '@moondreamsdev/dreamer-ui/components';
import { VaultItem } from '@lib/types/vault.types';
import { useSecureFileViewer } from '@hooks/useSecureFileViewer';
import { getViewerType } from '@utils/blobUtils';
import { Download, X } from '@moondreamsdev/dreamer-ui/symbols';

interface SecureFileViewerProps {
  item: VaultItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SecureFileViewer({ item, isOpen, onClose }: SecureFileViewerProps) {
  const { blobUrl, isLoading, error, decryptedData, loadFile, cleanup } = useSecureFileViewer();
  const [textContent, setTextContent] = useState<string | null>(null);

  // Load file when item changes
  useEffect(() => {
    if (item && isOpen) {
      loadFile(item);
    }
  }, [item, isOpen, loadFile]);

  // Handle text file decoding
  useEffect(() => {
    if (decryptedData && item?.metadata.mimeType?.startsWith('text/')) {
      const text = new TextDecoder().decode(decryptedData);
      setTextContent(text);
    } else {
      setTextContent(null);
    }
  }, [decryptedData, item]);

  // Cleanup on close
  const handleClose = () => {
    cleanup();
    setTextContent(null);
    onClose();
  };

  // Download handler
  const handleDownload = () => {
    if (!blobUrl || !item) return;

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = item.metadata.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!item) return null;

  const viewerType = getViewerType(item.metadata.mimeType || '');
  const mimeType = item.metadata.mimeType || '';

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-foreground/70 font-mono text-sm">DECRYPTING...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-2">
            <p className="text-destructive font-mono text-sm">ERROR</p>
            <p className="text-foreground/70 text-xs">{error}</p>
          </div>
        </div>
      );
    }

    if (!blobUrl) {
      return null;
    }

    switch (viewerType) {
      case 'image':
        return (
          <div className="flex items-center justify-center p-4">
            <img
              src={blobUrl}
              alt={item.metadata.name}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center p-4 bg-black/90">
            <video
              src={blobUrl}
              controls
              className="max-w-full max-h-[70vh]"
              controlsList="nodownload"
            >
              Your browser does not support video playback.
            </video>
          </div>
        );

      case 'audio':
        return (
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-center text-foreground/50">
              <svg
                className="w-24 h-24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <audio
              src={blobUrl}
              controls
              className="w-full"
              controlsList="nodownload"
            >
              Your browser does not support audio playback.
            </audio>
            <p className="text-center text-xs text-foreground/70 font-mono">
              {item.metadata.name}
            </p>
          </Card>
        );

      case 'pdf':
        return (
          <div className="w-full h-[80vh]">
            <iframe
              src={blobUrl}
              title={item.metadata.name}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        );

      case 'text':
        return (
          <Card className="p-6">
            <pre className="whitespace-pre-wrap font-mono text-sm text-foreground overflow-auto max-h-[70vh]">
              {textContent}
            </pre>
          </Card>
        );

      default:
        return (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-foreground/70 font-mono text-sm">
                PREVIEW NOT AVAILABLE
              </p>
              <p className="text-foreground/50 text-xs">
                Download the file to view it
              </p>
              <Button variant="primary" onClick={handleDownload}>
                <Download size={16} className="mr-2" />
                DOWNLOAD
              </Button>
            </div>
          </div>
        );
    }
  };

  // For images, PDFs, and videos, use full screen modal
  const isFullScreen = viewerType === 'image' || viewerType === 'pdf' || viewerType === 'video';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={item.metadata.name}
      className={join(isFullScreen && 'max-w-[95vw]')}
    >
      <div className="space-y-4">
        {/* File info */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-md border border-border">
          <div className="space-y-1">
            <p className="text-xs font-mono text-foreground/70">
              TYPE: <span className="text-foreground">{mimeType || 'Unknown'}</span>
            </p>
            {item.metadata.size && (
              <p className="text-xs font-mono text-foreground/70">
                SIZE: <span className="text-foreground">
                  {(item.metadata.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </p>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={handleDownload}
            disabled={!blobUrl}
            className="font-mono text-xs tracking-wider"
          >
            <Download size={16} className="mr-2" />
            DOWNLOAD
          </Button>
        </div>

        {/* Viewer content */}
        {renderContent()}

        {/* Security notice */}
        <div className="p-3 bg-muted/50 rounded-md border border-border">
          <p className="text-xs text-foreground/70 font-mono">
            🔒 SECURITY: This file is decrypted in your browser's memory only. It will be automatically cleared when you close this viewer.
          </p>
        </div>

        {/* Close button */}
        <div className="flex justify-end">
          <Button variant="secondary" onClick={handleClose} className="font-mono text-xs tracking-wider">
            <X size={16} className="mr-2" />
            CLOSE
          </Button>
        </div>
      </div>
    </Modal>
  );
}
