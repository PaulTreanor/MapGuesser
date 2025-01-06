import React from 'react';
import { describe, test, expect} from 'vitest';
import { render, screen } from '@testing-library/react';
import Modal from '@/components/Modal';

describe('Modal Component', () => {
    test('successfully renders child contents', () => {
        render(
            <Modal>
                <p>child contents</p>
            </Modal>
        );
		
        expect(screen.getByText('child contents')).toBeInTheDocument();
	});

});