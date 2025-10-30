import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, test, expect } from 'vitest'
import SelectGameModeMenu from '../../../components/game-setup-modal/SelectGameModeMenu'

describe('SelectGameModeMenu', () => {
        test('renders the game mode menu cards', () => {
                render(<SelectGameModeMenu />);

                expect(screen.getByText('Single Player Game')).toBeInTheDocument();
                expect(screen.getByText('Play solo and compete against your own best scores')).toBeInTheDocument();

                expect(screen.getByText('Start Multiplayer Game')).toBeInTheDocument();
                expect(screen.getByText('Create a game room and invite friends')).toBeInTheDocument();

                expect(screen.getByText('Join Multiplayer Game')).toBeInTheDocument();
                expect(screen.getByText('Join an existing game room')).toBeInTheDocument();
        });
});
