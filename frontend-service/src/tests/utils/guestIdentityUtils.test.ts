import { test, expect } from 'vitest';
import { generateGuestId, generateGuestName } from '../../utils/guestIdentityUtils';

test('generateGuestId returns a string with expected format', () => {
	const guestId = generateGuestId();
	expect(guestId).toMatch(/^guest_\d+_[a-z0-9]+$/);
});

test('generateGuestName returns a string with expected format', () => {
	const guestName = generateGuestName();
	expect(guestName).toMatch(/^Guest_\d{4}$/);
});
