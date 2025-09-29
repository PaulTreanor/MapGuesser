import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import SelectGameModeMenu from '../../../components/game-setup-modal/SelectGameModeMenu'
import { useAuth, useClerk } from '@clerk/clerk-react'

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
	useAuth: vi.fn(() => ({ isSignedIn: false })),
	useClerk: vi.fn(() => ({ openSignIn: vi.fn() }))
}));


describe('SelectGameModeMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('renders the game mode menu cards', () => {
		render(<SelectGameModeMenu />);
		
		expect(screen.getByText('Single Player Game')).toBeInTheDocument();
		expect(screen.getByText('Play solo and compete against your own best scores')).toBeInTheDocument();
		
		expect(screen.getByText('Start Multiplayer Game')).toBeInTheDocument();
		expect(screen.getByText('Create a game room and invite friends')).toBeInTheDocument();
		
		expect(screen.getByText('Join Multiplayer Game')).toBeInTheDocument();
		expect(screen.getByText('Join an existing game room')).toBeInTheDocument();
	});

	// test('if user is not logged in, dont progress start multiplayer game', () => {
	// 	const mockOpenSignIn = vi.fn();
	// 	vi.mocked(useAuth).mockReturnValue({ isSignedIn: false });
	// 	vi.mocked(useClerk).mockReturnValue({ openSignIn: mockOpenSignIn });

	// 	render(<SelectGameModeMenu />);
	// 	
	// 	const multiplayerCard = screen.getByText('Start Multiplayer Game');
	// 	fireEvent.click(multiplayerCard);
	// 	
	// 	expect(mockOpenSignIn).toHaveBeenCalled();
	// });
})