import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	duration?: number;
}

type NotificationAction = 
	| { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> & { id?: string } }
	| { type: 'REMOVE_NOTIFICATION'; payload: { id: string } };

interface NotificationContextType {
	notifications: Notification[];
	notify: (notification: Omit<Notification, 'id'>) => string;
	removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const DEFAULT_DURATION = 5000; // 5 seconds

const notificationReducer = (state: Notification[], action: NotificationAction): Notification[] => {
	switch (action.type) {
		case 'ADD_NOTIFICATION':
			return [...state, { id: action.payload.id || uuidv4(), ...action.payload }];
		case 'REMOVE_NOTIFICATION':
			return state.filter(notification => notification.id !== action.payload.id);
		default:
			return state;
	}
}

const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [notifications, dispatch] = useReducer(notificationReducer, []);

	const notify = useCallback((notification: Omit<Notification, 'id'>): string => {
		const id = uuidv4();
		
		dispatch({
			type: 'ADD_NOTIFICATION',
			payload: { ...notification, id }
		});

		// Auto-dismiss after duration
		const duration = notification.duration || DEFAULT_DURATION;
		setTimeout(() => {
			removeNotification(id);
		}, duration);

		return id;
	}, []);

	const removeNotification = useCallback((id: string) => {
		dispatch({
			type: 'REMOVE_NOTIFICATION',
			payload: { id }
		});
	}, []);

	return (
		<NotificationContext.Provider value={{ notifications, notify, removeNotification }}>
			{children}
		</NotificationContext.Provider>
	);
};

const useNotification = (): NotificationContextType => {
	const context = useContext(NotificationContext);
	
	if (context === undefined) {
		console.warn('useNotification must be used within a NotificationProvider');
		
		// Return a no-op implementation when used outside provider
		return {
			notifications: [],
			notify: () => '',
			removeNotification: () => {}
		};
	}
	
	return context;
};

let globalNotify: (notification: Omit<Notification, 'id'>) => string = () => {
	console.warn('Notification system not initialized yet');
	return '';
};

const setGlobalNotify = (notifyFn: (notification: Omit<Notification, 'id'>) => string) => {
	globalNotify = notifyFn;
};

const notify = (notification: Omit<Notification, 'id'>): string => {
	return globalNotify(notification);
};

export {
	NotificationProvider,
	useNotification,
	setGlobalNotify,
	notify
}