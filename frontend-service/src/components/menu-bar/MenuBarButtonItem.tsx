import React from 'react';

interface MenuBarButtonItemProps {
	children: React.ReactNode;
	onClick: () => void;
	disabled?: boolean;
	className?: string;
}

const MenuBarButtonItem = ({ 
	children, 
	onClick, 
	disabled = false, 
	className = '' 
}: MenuBarButtonItemProps) => {
	return (
		<button
			onClick={disabled ? undefined : onClick}
			disabled={disabled}
			className={`flex items-center justify-center px-4 py-1 text-gray-950 hover:bg-gray-950/10 active:bg-gray-950/20 transition-colors border-r border-gray-400/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
		>
			{children}
		</button>
	);
};

export default MenuBarButtonItem;