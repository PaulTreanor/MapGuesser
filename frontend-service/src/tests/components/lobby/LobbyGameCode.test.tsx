import React from 'react';
import { test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LobbyGameCode from '../../../components/lobby/LobbyGameCode';
import * as NotificationContext from '../../../context/NotificationContext';

const mockWriteText = vi.fn();

beforeEach(() => {
	vi.clearAllMocks();
	Object.assign(navigator, { clipboard: { writeText: mockWriteText } });
});

test('renders game code', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connected" />);
	expect(screen.getByText('ABC123')).toBeInTheDocument();
});

test('renders connection status text for connected', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connected" />);
	expect(screen.getByText('● Connected')).toBeInTheDocument();
});

test('renders connection status text for connecting', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connecting" />);
	expect(screen.getByText('○ Connecting...')).toBeInTheDocument();
});

test('renders connection status text for error', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="error" />);
	expect(screen.getByText('✕ Connection Error')).toBeInTheDocument();
});

test('renders connection status text for disconnected', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="disconnected" />);
	expect(screen.getByText('○ Disconnected')).toBeInTheDocument();
});

test('renders copy invite link button', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connected" />);
	expect(screen.getByText('Copy Invite Link')).toBeInTheDocument();
});

test('copies invite link to clipboard on click', async () => {
	const notifySpy = vi.spyOn(NotificationContext, 'notify').mockReturnValue('');
	const expectedLink = `${window.location.origin}${window.location.pathname}#join-game-ABC123`;
	mockWriteText.mockResolvedValue(undefined);

	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connected" />);

	fireEvent.click(screen.getByText('Copy Invite Link'));

	expect(mockWriteText).toHaveBeenCalledWith(expectedLink);
	await waitFor(() => {
		expect(notifySpy).toHaveBeenCalledWith({
			type: 'success',
			message: 'Invite link copied to clipboard!',
			duration: 3000,
		});
	});
});

test('shows copied feedback after copying link', async () => {
	mockWriteText.mockResolvedValue(undefined);

	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connected" />);

	fireEvent.click(screen.getByText('Copy Invite Link'));

	expect(await screen.findByText('Invite Link Copied!')).toBeInTheDocument();
});

test('notifies on clipboard failure', async () => {
	const notifySpy = vi.spyOn(NotificationContext, 'notify').mockReturnValue('');
	mockWriteText.mockRejectedValue(new Error('Clipboard blocked'));

	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connected" />);

	fireEvent.click(screen.getByText('Copy Invite Link'));

	await waitFor(() => {
		expect(notifySpy).toHaveBeenCalledWith({
			type: 'error',
			message: 'Failed to copy invite link.',
			duration: 5000,
		});
	});
});
