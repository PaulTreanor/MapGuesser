import React from 'react';
import mapBackground from '../images/mapguesser-background.webp';

const StaticMapBackground = () => (
	<div
		data-testid="static-map-background"
		aria-hidden="true"
		className="static-map-background relative w-full h-full overflow-hidden"
		style={{ backgroundImage: `url(${mapBackground})` }}
	>
		<div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />
	</div>
);

export default StaticMapBackground;
