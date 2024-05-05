import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-slate-100 p-8 rounded-lg shadow-lg max-w-2xl w-auto mx-1 sm:mx-2">
        {children}
      </div>
    </div>
  );
};

export default Modal;