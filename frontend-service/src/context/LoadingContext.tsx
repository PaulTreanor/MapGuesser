import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import LoadingOverlay from '../components/LoadingOverlay';

interface LoadingState {
	loadingStates: { [key: string]: boolean };
	loadingMessages: { [key: string]: string };
}

type LoadingAction = 
	| { type: 'SET_LOADING'; payload: { key: string; isLoading: boolean; message?: string } }
	| { type: 'REMOVE_KEY'; payload: { key: string } };

interface LoadingContextType {
	setLoading: (key: string, isLoading: boolean, message?: string) => void;
	isLoading: (key: string) => boolean;
	isAnyLoading: () => boolean;
	getLoadingKeys: () => string[];
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const CLEANUP_DELAY = 1000;

const loadingReducer = (state: LoadingState, action: LoadingAction): LoadingState => {
	switch (action.type) {
		case 'SET_LOADING': {
			const { key, isLoading, message } = action.payload;
			
			if (isLoading) {
				return {
					loadingStates: { ...state.loadingStates, [key]: true },
					loadingMessages: { 
						...state.loadingMessages, 
						[key]: message || `Loading ${key}...`
					}
				};
			} else {
				const newLoadingStates = { ...state.loadingStates };
				newLoadingStates[key] = false;
				
				return {
					...state,
					loadingStates: newLoadingStates
				};
			}
		}
		case 'REMOVE_KEY': {
			const { key } = action.payload;
			const newLoadingStates = { ...state.loadingStates };
			const newLoadingMessages = { ...state.loadingMessages };
			
			delete newLoadingStates[key];
			delete newLoadingMessages[key];
			
			return {
				loadingStates: newLoadingStates,
				loadingMessages: newLoadingMessages
			};
		}
		default:
			return state;
	}
}

const LoadingProvider = ({ children }: { children: ReactNode }) => {
	const [state, dispatch] = useReducer(loadingReducer, {
		loadingStates: {},
		loadingMessages: {}
	});

	const setLoading = useCallback((key: string, isLoading: boolean, message?: string) => {
		dispatch({
			type: 'SET_LOADING',
			payload: { key, isLoading, message }
		});

		// Schedule cleanup after delay when loading is set to false
		if (!isLoading) {
			setTimeout(() => {
				dispatch({
					type: 'REMOVE_KEY',
					payload: { key }
				});
			}, CLEANUP_DELAY);
		}
	}, []);

	const isLoading = useCallback((key: string): boolean => {
		return state.loadingStates[key] === true;
	}, [state.loadingStates]);

	const isAnyLoading = useCallback((): boolean => {
		return Object.values(state.loadingStates).some(loading => loading === true);
	}, [state.loadingStates]);

	const getLoadingKeys = useCallback((): string[] => {
		return Object.keys(state.loadingStates).filter(key => state.loadingStates[key] === true);
	}, [state.loadingStates]);

	// Get the first active loading message
	const getCurrentMessage = useCallback((): string => {
		const activeKeys = getLoadingKeys();
		if (activeKeys.length === 0) return '';
		
		const firstKey = activeKeys[0];
		return state.loadingMessages[firstKey] || `Loading ${firstKey}...`;
	}, [state.loadingMessages, getLoadingKeys]);

	const contextValue: LoadingContextType = {
		setLoading,
		isLoading,
		isAnyLoading,
		getLoadingKeys
	};

	return (
		<LoadingContext.Provider value={contextValue}>
			{children}
			{isAnyLoading() && <LoadingOverlay message={getCurrentMessage()} />}
		</LoadingContext.Provider>
	);
};

const useLoading = (): LoadingContextType => {
	const context = useContext(LoadingContext);
	
	if (context === undefined) {
		throw new Error('useLoading must be used within a LoadingProvider');
	}
	
	return context;
};


export {
	LoadingProvider,
	useLoading,
}