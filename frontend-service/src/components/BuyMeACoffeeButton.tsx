import React from 'react';
import coffeeCup from '../images/coffeeCup.svg';
import { useMapGuesserSound } from '../hooks/useMapGuesserSound';

const BuyMeACoffeeButton = () => {
	const { playSound } = useMapGuesserSound();

	return (
		<a
			href="https://buymeacoffee.com/paultreanor"
			target="_blank"
			rel="noopener noreferrer"
			onClick={() => playSound('CLICK')}
			className="inline-flex items-center h-[30px] min-w-[110px] px-3 bg-[#FFDD00] text-[#000000] text-[15px] leading-[24px] rounded-lg no-underline box-border font-cookie"
		>
			<img
				src={coffeeCup}
				alt=""
				className="h-[16px] flex-shrink-0 align-middle"
			/>
			<span className="ml-2 inline-block leading-[0] w-full flex-shrink-0 whitespace-nowrap font-cookie">
				Buy me a coffee
			</span>
		</a>
	);
};

export default BuyMeACoffeeButton;