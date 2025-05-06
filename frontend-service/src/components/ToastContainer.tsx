import React, { useEffect } from 'react';
import Toast from './Toast';
import { useNotification, setGlobalNotify } from '../context/NotificationContext';

const ToastContainer: React.FC = () => {
	const { notifications, notify, removeNotification } = useNotification();
	
	useEffect(() => {
		setGlobalNotify(notify);
		
		return () => {
			setGlobalNotify(() => {
				console.warn('Notification system not available');
				return '';
			});
		};
	}, [notify]);

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
				return 'success';
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