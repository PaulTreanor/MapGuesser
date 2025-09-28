import React from 'react';

type GameModeCardProps = {
	id: string;
	title: string;
	description: string;
	enabled: boolean;
	fragment: string;
	colorClasses: {
		bg: string;
		bgHover: string;
		border: string;
		borderHover: string;
	};
	onClick: () => void;
};

const GameModeCard = ({ 
	id, 
	title, 
	description, 
	enabled, 
	colorClasses, 
	onClick 
}: GameModeCardProps) => {
	return (
		<div
			key={id}
			onClick={onClick}
			className={`
				relative p-6 rounded-lg border-2 transition-all duration-200
				${enabled 
					? `${colorClasses.bg} ${colorClasses.bgHover} ${colorClasses.border} ${colorClasses.borderHover} cursor-pointer hover:shadow-lg` 
					: 'bg-gray-100 border-gray-200 cursor-not-allowed opacity-60'
				}
			`}
		>
			<div className="text-center">
				<h3 className={`text-lg font-semibold mb-2 ${enabled ? 'text-gray-900' : 'text-gray-500'}`}>
					{title}
				</h3>
				<p className={`text-sm mb-4 ${enabled ? 'text-gray-600' : 'text-gray-400'}`}>
					{description}
				</p>
			</div>
		</div>
	);
};

export default GameModeCard;