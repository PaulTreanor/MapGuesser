import React from 'react';
import RoundTimerSelectionSlider from '../roundTimerSelectionSlider';
import { Paragraph } from '../typography/Typography';
import { TIMER_OPTIONS, getTimerIndexFromMs } from '../../objects/roundTimerSliderOptions';

type LobbyGameSettingsProps = {
	timer?: number;
	isGameOwner: boolean;
	onTimerChange: (timeMs: number) => void;
};

const getTimerLabel = (timeMs?: number): string => {
	const option = TIMER_OPTIONS.find((timerOption) => timerOption.timeMs === (timeMs ?? 0));
	return option?.desktopLabel ?? 'No timer';
};

const LobbyGameSettings = ({ timer, isGameOwner, onTimerChange }: LobbyGameSettingsProps) => {
	if (!isGameOwner) {
		return (
			<Paragraph className="text-center text-gray-600 mb-4">
				Round timer: {getTimerLabel(timer)}
			</Paragraph>
		);
	}

	return (
		<div className="mb-4">
			<Paragraph className="text-center text-gray-600 mb-2">
				Round timer (you can change this between games)
			</Paragraph>
			<RoundTimerSelectionSlider
				valueIndex={getTimerIndexFromMs(timer)}
				notifyOnMount={false}
				onChange={(_hasTimer, timeMs) => onTimerChange(timeMs)}
			/>
		</div>
	);
};

export default LobbyGameSettings;
