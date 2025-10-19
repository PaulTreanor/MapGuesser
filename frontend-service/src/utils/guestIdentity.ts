/**
 * Utilities for managing guest player identity
 */

const GUEST_ID_KEY = 'mapguesser_guest_id';
const GUEST_NAME_KEY = 'mapguesser_guest_name';

/**
 * Generate a random guest ID
 */
const generateGuestId = (): string => {
	return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Generate a random guest name
 */
const generateGuestName = (): string => {
	const randomNum = Math.floor(Math.random() * 9999);
	return `Guest_${randomNum.toString().padStart(4, '0')}`;
};

/**
 * Get or create a guest ID (persisted in localStorage)
 */
const getGuestId = (): string => {
	let guestId = localStorage.getItem(GUEST_ID_KEY);

	if (!guestId) {
		guestId = generateGuestId();
		localStorage.setItem(GUEST_ID_KEY, guestId);
	}

	return guestId;
};

/**
 * Get or create a guest name (persisted in localStorage)
 */
const getGuestName = (): string => {
	let guestName = localStorage.getItem(GUEST_NAME_KEY);

	if (!guestName) {
		guestName = generateGuestName();
		localStorage.setItem(GUEST_NAME_KEY, guestName);
	}

	return guestName;
};

/**
 * Clear guest identity from localStorage
 */
const clearGuestIdentity = (): void => {
	localStorage.removeItem(GUEST_ID_KEY);
	localStorage.removeItem(GUEST_NAME_KEY);
};

/**
 * Get player identity (Clerk user or guest)
 */
const getPlayerIdentity = (clerkUser?: { id: string; fullName?: string | null }): {
	playerId: string;
	playerName: string;
	isGuest: boolean;
} => {
	if (clerkUser?.id) {
		return {
			playerId: clerkUser.id,
			playerName: clerkUser.fullName || 'Player',
			isGuest: false,
		};
	}

	return {
		playerId: getGuestId(),
		playerName: getGuestName(),
		isGuest: true,
	};
};

export {
	getGuestId,
	getGuestName,
	getPlayerIdentity,
	clearGuestIdentity,
};
