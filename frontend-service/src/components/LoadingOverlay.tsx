import React from 'react';
import { MapGuesserHeading } from './typography/MapGuesserHeading';

interface LoadingOverlayProps {
	message: string;
}

const LoadingOverlay = ({ message }: LoadingOverlayProps) => {
	return (
		<div className="fixed inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center">
			<div className="bg-slate-100 p-6 md:p-8 rounded-lg shadow-lg max-w-lg w-full mx-4">
				<div className="text-center">
					<div className="mb-6">
						<MapGuesserHeading />
					</div>
					
					<div className="mb-6">
						{/* Animated CSS-based spinner  */}
						<div className="inline-block w-8 h-8 border-4 border-blue-800 border-t-transparent rounded-full animate-spin"></div>
					</div>
					
					<p className="text-slate-700 text-lg font-medium">
						{message}
					</p>
				</div>
			</div>
		</div>
	);
};

export default LoadingOverlay;