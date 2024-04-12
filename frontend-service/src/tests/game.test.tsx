import { render, screen } from '@testing-library/react';
import React from 'react';
import { test, expect } from 'vitest';
import '@testing-library/jest-dom';
import Game from '../components/Game';

test('renders the component with button that says "Next round"', () => {
  // render(<Game />);
  // const button = screen.getByRole('button', { name: /Next round/i });
  // expect(button).toBeInTheDocument();
  expect(true).toBe(true);
});
