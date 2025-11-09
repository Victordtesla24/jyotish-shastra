/**
 * PreLoader Component Tests
 * Tests the preloader component rendering and timing behavior
 * Based on Jest timer mocking best practices
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PreLoader, {
  MIN_VISIBLE_DURATION,
  POST_HIDE_DELAY
} from './PreLoader';

describe('PreLoader Component', () => {
  beforeEach(() => {
    // Use fake timers to control setTimeout behavior
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore real timers after each test
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Initial Render', () => {
    it('should render preloader immediately on mount', () => {
      render(<PreLoader delay={1500} />);
      
      // Verify preloader is visible immediately
      const preloader = screen.getByTestId('preloader-chris-cole');
      expect(preloader).toBeInTheDocument();
      expect(preloader).toBeVisible();
    });

    it('should display "loading" text', () => {
      render(<PreLoader delay={1500} />);
      
      const loadingText = screen.getByText(/loading/i);
      expect(loadingText).toBeInTheDocument();
      expect(loadingText).toBeVisible();
    });

    it('should render overlay container class', () => {
      render(<PreLoader delay={1500} />);
      
      const preloader = screen.getByTestId('preloader-chris-cole');
      expect(preloader).toHaveClass('preloader-overlay');
    });

    it('should contain animated rings markup', () => {
      render(<PreLoader delay={1500} />);

      const rings = screen.getAllByTestId('preloader-ring');
      expect(rings).toHaveLength(8);
    });
  });

  describe('Timing Behavior', () => {
    it('should remain visible before minimum duration expires', () => {
      render(<PreLoader delay={1500} />);

      jest.advanceTimersByTime(MIN_VISIBLE_DURATION - 100);

      const preloader = screen.getByTestId('preloader-chris-cole');
      expect(preloader).toBeInTheDocument();
      expect(preloader).toBeVisible();
    });

    it('should hide after delay expires', () => {
      render(<PreLoader delay={1500} />);

      expect(screen.getByTestId('preloader-chris-cole')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(MIN_VISIBLE_DURATION);
      });

      expect(screen.queryByTestId('preloader-chris-cole')).not.toBeInTheDocument();
    });

    it('should call onComplete callback after delay + transition', () => {
      const onCompleteMock = jest.fn();
      render(<PreLoader delay={1500} onComplete={onCompleteMock} />);

      jest.advanceTimersByTime(MIN_VISIBLE_DURATION);
      expect(onCompleteMock).not.toHaveBeenCalled();

      jest.advanceTimersByTime(POST_HIDE_DELAY);
      expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });

    it('should honour custom delay greater than minimum duration', () => {
      const customDelay = MIN_VISIBLE_DURATION + 1200;
      render(<PreLoader delay={customDelay} />);

      jest.advanceTimersByTime(customDelay - 100);
      expect(screen.getByTestId('preloader-chris-cole')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(120);
      });

      expect(screen.queryByTestId('preloader-chris-cole')).not.toBeInTheDocument();
    });

    it('should clamp delays below minimum duration', () => {
      const customDelay = 500;
      render(<PreLoader delay={customDelay} />);

      jest.advanceTimersByTime(customDelay + 200);
      expect(screen.getByTestId('preloader-chris-cole')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(MIN_VISIBLE_DURATION - customDelay);
      });
      expect(screen.queryByTestId('preloader-chris-cole')).not.toBeInTheDocument();
    });
  });

  describe('Cleanup', () => {
    it('should clear timers on unmount', () => {
      const { unmount } = render(<PreLoader delay={1500} />);
      
      // Unmount before delay expires
      unmount();
      
      // Advance timers - should not cause errors
      jest.advanceTimersByTime(2000);
      
      // Test passes if no errors thrown
    });
  });

  describe('Integration with App', () => {
    it('should work with zero delay for testing', () => {
      render(<PreLoader delay={0} />);

      expect(screen.getByTestId('preloader-chris-cole')).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(MIN_VISIBLE_DURATION);
      });
      expect(screen.queryByTestId('preloader-chris-cole')).not.toBeInTheDocument();
    });
  });
});
