import React from 'react';

interface MenuBarItemProps {
	children: React.ReactNode;
	className?: string;
}

const MenuBarItem = ({ children, className = '' }: MenuBarItemProps) => {
	return (
		<div className={`flex items-center justify-center px-4 py-1 text-gray-950 font-medium border-l border-gray-400/50 ${className}`}>
			{children}
		</div>
	);
};

export default MenuBarItem;