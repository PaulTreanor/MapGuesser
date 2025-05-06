import React, { useEffect } from 'react';
import Toast from './Toast';
import { useNotification, setGlobalNotify } from '../context/NotificationContext';

const ToastContainer: React.FC = () => {
	const { notifications, notify, removeNotification } = useNotification();
	
	// Register the global notify function when the component mounts
	useEffect(() => {
		setGlobalNotify(notify);
		
		return () => {
			// Reset global notify on unmount
			setGlobalNotify(() => {
				console.warn('Notification system not available');
				return '';
			});
		};
	}, [notify]);

	// Map notification types to Toast component types
	const mapNotificationTypeToToastType = (type: string): 'success' | 'danger' | 'warning' => {
		switch (type) {
			case 'success':
				return 'success';
			case 'error':
				return 'danger';
			case 'warning':
				return 'warning';
			case 'info':
			default:
				return 'success'; // Using success toast for info notifications
		}
	};

	if (notifications.length === 0) {
		return null;
	}

	return (
		<div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
			{notifications.map((notification) => (
				<Toast
					key={notification.id}
					type={mapNotificationTypeToToastType(notification.type)}
					message={notification.message}
					onClose={() => removeNotification(notification.id)}
				/>
			))}
		</div>
	);
};

export default ToastContainer;