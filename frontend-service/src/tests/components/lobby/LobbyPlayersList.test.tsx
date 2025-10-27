import React from 'react';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LobbyPlayersList from '../../../components/lobby/LobbyPlayersList';
import type { Player } from '../../../types/MultiplayerServiceApiResponse.types';

test('renders empty state when no players', () => {
	render(<LobbyPlayersList players={[]} />);
	expect(screen.getByText('Players in lobby: 0')).toBeInTheDocument();
	expect(screen.getByText('Waiting for players to join...')).toBeInTheDocument();
});

test('renders player list with player names', () => {
	const players: Player[] = [
		{ playerId: '1', playerName: 'Alice', isGuest: false },
		{ playerId: '2', playerName: 'Bob', isGuest: true },
	];
	render(<LobbyPlayersList players={players} />);
	expect(screen.getByText('Players in lobby: 2')).toBeInTheDocument();
	expect(screen.getByText('Alice')).toBeInTheDocument();
	expect(screen.getByText('Bob')).toBeInTheDocument();
});

test('shows guest badge for guest players', () => {
	const players: Player[] = [
		{ playerId: '1', playerName: 'Guest_1234', isGuest: true },
	];
	render(<LobbyPlayersList players={players} />);
	expect(screen.getByText('Guest')).toBeInTheDocument();
});

test('shows host badge for game owner', () => {
	const players: Player[] = [
		{ playerId: 'owner-id', playerName: 'Alice', isGuest: false },
		{ playerId: '2', playerName: 'Bob', isGuest: false },
	];
	render(<LobbyPlayersList players={players} gameOwnerId="owner-id" />);
	expect(screen.getByText('Host')).toBeInTheDocument();
});
