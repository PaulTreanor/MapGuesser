import React, { useState } from 'react';
import { Button } from './ui/button';
import type { NotificationType } from '../context/NotificationContext';

type ToastProps = {
	type: NotificationType;
	message: string;
	onClose?: () => void;
};

const toastConfig = {
	success: {
		id: 'toast-success',
		iconColor: 'text-green-700',
		bgColor: 'bg-green-50',
		borderColor: 'border-green-200',
		textColor: 'text-green-800',
		iconPath: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z",
		srText: 'Success'
	},
	info: {
		id: 'toast-info',
		iconColor: 'text-blue-700',
		bgColor: 'bg-blue-50',
		borderColor: 'border-blue-200',
		textColor: 'text-blue-800',
		iconPath: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z",
		srText: 'Info'
	},
	error: {
		id: 'toast-error',
		iconColor: 'text-red-700',
		bgColor: 'bg-red-50',
		borderColor: 'border-red-200',
		textColor: 'text-red-800',
		iconPath: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z",
		srText: 'Error'
	},
	warning: {
		id: 'toast-warning',
		iconColor: 'text-amber-700',
		bgColor: 'bg-amber-50',
		borderColor: 'border-amber-200',
		textColor: 'text-amber-800',
		iconPath: "M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z",
		srText: 'Warning'
	}
};

const Toast = ({ type, message, onClose = () => {} }: ToastProps) => {
	const [isVisible, setIsVisible] = useState(true);
	const config = toastConfig[type];

	const handleClose = () => {
		setIsVisible(false);
		onClose();
	};

	if (!isVisible) {
		return null;
	}

	return (
		<div 
			id={config.id} 
			className={`
				font-roboto flex items-center gap-3 w-full max-w-sm p-4 
				rounded-lg border shadow-lg backdrop-blur-sm
				${config.bgColor} ${config.borderColor} ${config.textColor}
				animate-in slide-in-from-top-2 duration-300
			`} 
			role="alert"
		>
			<div className={`
				flex items-center justify-center flex-shrink-0 w-8 h-8 
				${config.iconColor} rounded-full bg-white/50
			`}>
				<svg 
					className="w-5 h-5" 
					aria-hidden="true" 
					xmlns="http://www.w3.org/2000/svg" 
					fill="currentColor" 
					viewBox="0 0 20 20"
				>
					<path d={config.iconPath} />
				</svg>
				<span className="sr-only">{config.srText}</span>
			</div>
			
			<div className="flex-1 text-sm font-medium">{message}</div>
			
			<Button
				variant="ghost"
				size="sm"
				className="h-6 w-6 p-0 hover:bg-white/50 text-current"
				onClick={handleClose}
				aria-label="Close notification"
			>
				<svg 
					className="w-4 h-4" 
					aria-hidden="true" 
					xmlns="http://www.w3.org/2000/svg" 
					fill="none" 
					viewBox="0 0 14 14"
				>
					<path 
						stroke="currentColor" 
						strokeLinecap="round" 
						strokeLinejoin="round" 
						strokeWidth="2" 
						d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
					/>
				</svg>
			</Button>
		</div>
	);
};

export default Toast;