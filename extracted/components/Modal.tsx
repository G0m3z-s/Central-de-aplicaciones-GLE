import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AppItem } from '../types';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: AppItem | null;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, app }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !app) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="bg-white w-full max-w-5xl h-[85vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fade-in-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <img 
              src={`https://www.google.com/s2/favicons?sz=32&domain_url=${app.url}`} 
              alt="" 
              className="w-5 h-5"
            />
            <div>
              <h3 className="text-sm font-bold text-gray-900">{app.name}</h3>
              <p className="text-xs text-gray-500 truncate max-w-xs">{app.url}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => window.open(app.url, '_blank', 'noopener,noreferrer')}
            >
              Abrir en nueva pestaña ↗
            </Button>
            <button 
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-100 relative">
          <iframe 
            src={app.url} 
            title={app.name}
            className="w-full h-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            loading="lazy"
          />
          {/* Overlay hint if iframe is blocked */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
             <div className="bg-white/80 p-4 rounded text-center text-xs text-gray-500 max-w-sm">
                Si no ves el contenido, es posible que <strong>{app.name}</strong> bloquee la vista previa. 
                <br/>Usa el botón "Abrir en nueva pestaña".
             </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};