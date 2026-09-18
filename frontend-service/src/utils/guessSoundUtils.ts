import { playUiSound } from './soundPlayer';
import { TERRIBLE_GUESS_THRESHOLD_KM } from '../objects/gameConsts';

const playGuessResultSound = (distance: number | null, timedOut: boolean) => {
	if (timedOut) {
		playUiSound('TERRIBLE_GUESS');
		return;
	}

	if (distance === 0) {
		playUiSound('PERFECT_GUESS');
		return;
	}

	if (distance !== null && distance >= TERRIBLE_GUESS_THRESHOLD_KM) {
		playUiSound('TERRIBLE_GUESS');
	}
};

export { playGuessResultSound };