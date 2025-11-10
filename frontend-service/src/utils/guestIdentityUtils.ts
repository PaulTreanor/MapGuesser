import { Player } from '../types/MultiplayerServiceApiResponse.types'
/**
 * Utilities for managing guest player identity
 * Guest identities persisted in localStorage.
 */

const GUEST_ID_KEY = 'mapguesser_guest_id';
const GUEST_NAME_KEY = 'mapguesser_guest_name';

const generateGuestId = (): string => {
	return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

const generateGuestName = (): string => {
	const randomNum = Math.floor(Math.random() * 9999);
	return `Guest_${randomNum.toString().padStart(4, '0')}`;
};

const getGuestId = (): string => {
	let guestId = localStorage.getItem(GUEST_ID_KEY);

	if (!guestId) {
		guestId = generateGuestId();
		localStorage.setItem(GUEST_ID_KEY, guestId);
	}

	return guestId;
};

const getGuestName = (): string => {
	let guestName = localStorage.getItem(GUEST_NAME_KEY);

	if (!guestName) {
		guestName = generateGuestName();
		localStorage.setItem(GUEST_NAME_KEY, guestName);
	}

	return guestName;
};

const clearGuestIdentity = (): void => {
	localStorage.removeItem(GUEST_ID_KEY);
	localStorage.removeItem(GUEST_NAME_KEY);
};

const getPlayerIdentity = (): Player => {
	return {
		playerId: getGuestId(),
		playerName: getGuestName(),
		isGuest: true,
	};
};

export {
	generateGuestId,
	generateGuestName,
	getGuestId,
	getGuestName,
	getPlayerIdentity,
	clearGuestIdentity,
};
