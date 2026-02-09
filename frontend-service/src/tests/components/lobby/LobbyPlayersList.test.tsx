import React from 'react';
import { test, expect, describe, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LobbyPlayersList from '../../../components/lobby/LobbyPlayersList';
import type { Player } from '../../../types/MultiplayerServiceApiResponse.types';

describe('LobbyPlayersList', () => {
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

	test('shows guest badge for guest players who are not the current player', () => {
		const players: Player[] = [
			{ playerId: '1', playerName: 'Guest_1234', isGuest: true },
		];
		render(<LobbyPlayersList players={players} currentPlayerId="different-id" />);
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

	test('shows "You" badge for current player', () => {
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
			{ playerId: '2', playerName: 'Bob', isGuest: false },
		];
		render(<LobbyPlayersList players={players} currentPlayerId="current-player" />);
		expect(screen.getByText('You')).toBeInTheDocument();
	});

	test('shows Edit button only for current player', () => {
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
			{ playerId: '2', playerName: 'Bob', isGuest: false },
		];
		render(<LobbyPlayersList players={players} currentPlayerId="current-player" />);

		const editButtons = screen.getAllByText('Edit');
		expect(editButtons).toHaveLength(1);
	});

	test('clicking Edit shows input field with Save and Cancel buttons', () => {
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
		];
		render(<LobbyPlayersList players={players} currentPlayerId="current-player" />);

		fireEvent.click(screen.getByText('Edit'));

		expect(screen.getByRole('textbox')).toBeInTheDocument();
		expect(screen.getByRole('textbox')).toHaveValue('Alice');
		expect(screen.getByText('Save')).toBeInTheDocument();
		expect(screen.getByText('Cancel')).toBeInTheDocument();
		expect(screen.queryByText('Edit')).not.toBeInTheDocument();
	});

	test('clicking Cancel exits edit mode without calling onNameChange', () => {
		const mockOnNameChange = vi.fn();
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
		];
		render(
			<LobbyPlayersList
				players={players}
				currentPlayerId="current-player"
				onNameChange={mockOnNameChange}
			/>
		);

		fireEvent.click(screen.getByText('Edit'));
		fireEvent.change(screen.getByRole('textbox'), { target: { value: 'NewName' } });
		fireEvent.click(screen.getByText('Cancel'));

		expect(mockOnNameChange).not.toHaveBeenCalled();
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
		expect(screen.getByText('Edit')).toBeInTheDocument();
	});

	test('clicking Save calls onNameChange with new name', () => {
		const mockOnNameChange = vi.fn();
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
		];
		render(
			<LobbyPlayersList
				players={players}
				currentPlayerId="current-player"
				onNameChange={mockOnNameChange}
			/>
		);

		fireEvent.click(screen.getByText('Edit'));
		fireEvent.change(screen.getByRole('textbox'), { target: { value: 'NewName' } });
		fireEvent.click(screen.getByText('Save'));

		expect(mockOnNameChange).toHaveBeenCalledWith('NewName');
	});

	test('pressing Enter saves the name', () => {
		const mockOnNameChange = vi.fn();
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
		];
		render(
			<LobbyPlayersList
				players={players}
				currentPlayerId="current-player"
				onNameChange={mockOnNameChange}
			/>
		);

		fireEvent.click(screen.getByText('Edit'));
		fireEvent.change(screen.getByRole('textbox'), { target: { value: 'NewName' } });
		fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });

		expect(mockOnNameChange).toHaveBeenCalledWith('NewName');
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
	});

	test('pressing Escape cancels editing', () => {
		const mockOnNameChange = vi.fn();
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
		];
		render(
			<LobbyPlayersList
				players={players}
				currentPlayerId="current-player"
				onNameChange={mockOnNameChange}
			/>
		);

		fireEvent.click(screen.getByText('Edit'));
		fireEvent.change(screen.getByRole('textbox'), { target: { value: 'NewName' } });
		fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Escape' });

		expect(mockOnNameChange).not.toHaveBeenCalled();
		expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
	});

	test('does not call onNameChange if name is unchanged', () => {
		const mockOnNameChange = vi.fn();
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
		];
		render(
			<LobbyPlayersList
				players={players}
				currentPlayerId="current-player"
				onNameChange={mockOnNameChange}
			/>
		);

		fireEvent.click(screen.getByText('Edit'));
		fireEvent.click(screen.getByText('Save'));

		expect(mockOnNameChange).not.toHaveBeenCalled();
	});

	test('does not call onNameChange if name is only whitespace', () => {
		const mockOnNameChange = vi.fn();
		const players: Player[] = [
			{ playerId: 'current-player', playerName: 'Alice', isGuest: false },
		];
		render(
			<LobbyPlayersList
				players={players}
				currentPlayerId="current-player"
				onNameChange={mockOnNameChange}
			/>
		);

		fireEvent.click(screen.getByText('Edit'));
		fireEvent.change(screen.getByRole('textbox'), { target: { value: '   ' } });
		fireEvent.click(screen.getByText('Save'));

		expect(mockOnNameChange).not.toHaveBeenCalled();
	});
});
