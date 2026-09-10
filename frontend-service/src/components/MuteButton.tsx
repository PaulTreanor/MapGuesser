import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import MenuBarButtonItem from './menu-bar/MenuBarButtonItem';
import { useSoundStore } from '../store/soundStore';

const MuteButton = () => {
	const soundEnabled = useSoundStore((state) => state.soundEnabled);
	const toggleSoundEnabled = useSoundStore((state) => state.toggleSoundEnabled);

	return (
		<MenuBarButtonItem onClick={toggleSoundEnabled} className={soundEnabled ? '' : 'text-rose-600'}>
			{soundEnabled ? (
				<Volume2 className="w-5 h-5" aria-hidden="true" />
			) : (
				<VolumeX className="w-5 h-5" aria-hidden="true" />
			)}
			<span className="sr-only">{soundEnabled ? 'Mute sounds' : 'Unmute sounds'}</span>
		</MenuBarButtonItem>
	);
};

export default MuteButton;