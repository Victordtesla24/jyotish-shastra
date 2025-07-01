import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BirthDataForm from './BirthDataForm';
import geocodingService from '../../services/geocodingService';

// Mock the geocoding service
jest.mock('../../services/geocodingService', () => ({
  geocodeLocation: jest.fn(),
}));

// Mock framer-motion as it's not relevant to this component's logic tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    ...jest.requireActual('framer-motion'),
    AnimatePresence: ({ children }) => <>{children}</>,
    motion: {
      div: React.forwardRef((props, ref) => <div ref={ref} {...props} />),
      span: React.forwardRef((props, ref) => <span ref={ref} {...props} />),
    },
  };
});

describe('BirthDataForm', () => {
  beforeEach(() => {
    // Reset mocks before each test
    geocodingService.geocodeLocation.mockClear();
  });

  test('renders all form fields', () => {
    render(<BirthDataForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time zone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
  });

  test('shows validation errors for required fields', async () => {
    render(<BirthDataForm onSubmit={jest.fn()} />);

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /generate chart/i }));
    });

    expect(await screen.findByText(/full name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
    expect(screen.getByText(/time of birth is required/i)).toBeInTheDocument();
    // The error message is "Place of birth is required."
    expect(screen.getByText(/place of birth is required\./i)).toBeInTheDocument();
    expect(screen.getByText(/time zone is required/i)).toBeInTheDocument();
  });

  test('calls onSubmit with form data when valid', async () => {
    const mockSubmit = jest.fn();
    geocodingService.geocodeLocation.mockResolvedValue({
      success: true,
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 'Asia/Kolkata',
      formatted_address: 'Pune, Maharashtra, India',
    });

    render(<BirthDataForm onSubmit={mockSubmit} />);

    await act(async () => {
      await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
      await userEvent.type(screen.getByLabelText(/date of birth/i), '1990-01-01');
      await userEvent.type(screen.getByLabelText(/time of birth/i), '12:00');
      await userEvent.type(screen.getByLabelText(/place of birth/i), 'Pune, India');
    });

    // Wait for geocoding to complete and update the form
    await waitFor(() => {
      expect(screen.getByText(/Location found and coordinates generated!/i)).toBeInTheDocument();
    });

    await act(async () => {
      await userEvent.selectOptions(screen.getByLabelText(/time zone/i), 'Asia/Kolkata');
      await userEvent.selectOptions(screen.getByLabelText(/gender/i), 'male');

      await userEvent.click(screen.getByRole('button', { name: /generate chart/i }));
    });

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '12:00',
        placeOfBirth: 'Pune, India',
        timezone: 'Asia/Kolkata',
        gender: 'male',
        latitude: 18.5204,
        longitude: 73.8567,
      }));
    });
  });
});
