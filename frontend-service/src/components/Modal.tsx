import React from 'react';

interface ModalProps {
	children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ children }) => {
	return (
		<div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex justify-center items-start sm:items-center overflow-y-auto">
			<div className="bg-slate-100 p-3 md:p-8 rounded-lg shadow-lg max-w-2xl w-auto mx-4 sm:mx-2 my-4 sm:my-0 max-h-screen overflow-y-auto">
				{children}
			</div>
		</div>
	);
};

export default Modal;