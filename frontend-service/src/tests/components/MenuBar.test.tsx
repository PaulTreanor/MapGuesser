import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MenuBar from '../../components/MenuBar';
import { numberOfRoundsInGame } from '../../objects/gameConsts';

describe('MenuBar Component', () => {
	const minProps = {
		score: 0,
		currentRoundIndex: 0,
	};

	test('should render Settings and About buttons', () => {
		render(<MenuBar {...minProps} />);

		expect(screen.getByText('Settings')).toBeInTheDocument();
		expect(screen.getByText('About')).toBeInTheDocument();
	});

	test('should render score and round info starting from round 0 (displayed as round 1)', () => {
		render(<MenuBar {...minProps} />);

		expect(screen.getByText('0 pts')).toBeInTheDocument();
		expect(screen.getByText(`1/${numberOfRoundsInGame}`)).toBeInTheDocument();
	});

	test('should render score and round info when on round 1 or higher', () => {
		render(
			<MenuBar
				score={150}
				currentRoundIndex={1}
			/>
		);

		expect(screen.getByText('150 pts')).toBeInTheDocument();
		expect(screen.getByText(`2/${numberOfRoundsInGame}`)).toBeInTheDocument();
	});

	test('should display correct score formatting', () => {
		render(
			<MenuBar
				score={2500}
				currentRoundIndex={2}
			/>
		);

		expect(screen.getByText('2500 pts')).toBeInTheDocument();
	});

	test('should display correct round progression', () => {
		render(
			<MenuBar
				score={100}
				currentRoundIndex={3}
			/>
		);

		expect(screen.getByText(`4/${numberOfRoundsInGame}`)).toBeInTheDocument();
	});

	test('should render score and round info on the last round', () => {
		render(
			<MenuBar
				score={1000}
				currentRoundIndex={numberOfRoundsInGame - 1}
			/>
		);

		expect(screen.getByText('1000 pts')).toBeInTheDocument();
		expect(screen.getByText(`${numberOfRoundsInGame}/${numberOfRoundsInGame}`)).toBeInTheDocument();
	});

	test('should handle zero score correctly on active rounds', () => {
		render(
			<MenuBar
				score={0}
				currentRoundIndex={1}
			/>
		);

		expect(screen.getByText('0 pts')).toBeInTheDocument();
	});

	test('should handle high scores correctly', () => {
		render(
			<MenuBar
				score={99999}
				currentRoundIndex={1}
			/>
		);

		expect(screen.getByText('99999 pts')).toBeInTheDocument();
	});
});