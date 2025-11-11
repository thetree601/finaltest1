'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import styles from './modal.provider.module.css';

interface ModalContextType {
  isOpen: boolean;
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
  content: ReactNode;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);

  const openModal = useCallback((modalContent: ReactNode) => {
    setContent(modalContent);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setContent(null);
  }, []);

  const value = {
    isOpen,
    openModal,
    closeModal,
    content,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <ModalPortal isOpen={isOpen} onClose={closeModal}>
        {content}
      </ModalPortal>
    </ModalContext.Provider>
  );
};

interface ModalPortalProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children, isOpen, onClose }) => {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isOpen || !isMounted) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalRoot = typeof document !== 'undefined' 
    ? (document.getElementById('modal-root') || document.body)
    : null;

  if (!modalRoot) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modalWrapper}>
        <button className={styles.closeButton} onClick={onClose}>
          ✕
        </button>
        {children}
      </div>
    </div>,
    modalRoot
  );
};

