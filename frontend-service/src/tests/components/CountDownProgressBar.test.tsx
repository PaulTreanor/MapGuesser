import React from 'react'
import { render, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CountDownProgressBar from '../../components/countDownProgressBar'

describe('CountDownProgressBar', () => {
	beforeEach(() => {
		vi.useFakeTimers()
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('renders correctly with future timestamp', () => {
		// Set timestamp 30 seconds into the future
		const futureTimestamp = Date.now() + 30000
		render(<CountDownProgressBar progressBarFullTimeStamp={futureTimestamp} />)
		expect(document.querySelector('[role="progressbar"]')).toBeInTheDocument()

		act(() => {
			vi.advanceTimersByTime(5000)
		})

		// The progress component should still be rendered after time advances
		expect(document.querySelector('[role="progressbar"]')).toBeInTheDocument()
	})
})