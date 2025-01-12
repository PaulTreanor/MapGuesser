import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Toast from '@/components/Toast';

describe('Toast Component', () => {
	test('renders success toast for success message', () => {
		render(<Toast type="success" message="Operation successful" />);
		
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText('Operation successful')).toBeInTheDocument();
		expect(screen.getByText('Check icon')).toBeInTheDocument();
	});

	test('renders danger toast for error message', () => {
		render(<Toast type="danger" message="Error occurred" />);
		
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText('Error occurred')).toBeInTheDocument();
		expect(screen.getByText('Error icon')).toBeInTheDocument();
	});

	test('renders warning toast for warning message', () => {
		render(<Toast type="warning" message="Warning message" />);
		
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText('Warning message')).toBeInTheDocument();
		expect(screen.getByText('Warning icon')).toBeInTheDocument();
	});

	test('closes toast when close button is clicked', () => {
		render(<Toast type="success" message="Test message" />);
		
		const closeButton = screen.getByRole('button', { name: /close/i });
		expect(screen.getByRole('alert')).toBeInTheDocument();
		
		fireEvent.click(closeButton);
		
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	test('calls onClose callback when provided and toast is closed', () => {
		const onCloseMock = vi.fn();
		render(<Toast type="success" message="Test message" onClose={onCloseMock} />);
		
		const closeButton = screen.getByRole('button', { name: /close/i });
		fireEvent.click(closeButton);
		
		expect(onCloseMock).toHaveBeenCalledTimes(1);
	});
});