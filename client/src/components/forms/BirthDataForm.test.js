import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BirthDataForm from './BirthDataForm';
import geocodingService from '../../services/geocodingService';

// Mock the UIDataSaver
jest.mock('./UIDataSaver');

// Mock the UIToAPIDataInterpreter
jest.mock('./UIToAPIDataInterpreter');

// Mock the geocoding service
jest.mock('../../services/geocodingService');

// Import the mocked modules
import UIDataSaver from './UIDataSaver';
import UIToAPIDataInterpreter from './UIToAPIDataInterpreter';

// Set up default mock implementations
beforeEach(() => {
  // Reset all mocks before each test
  jest.clearAllMocks();

  // Default UIDataSaver mock implementation (singleton pattern)
  UIDataSaver.saveSession = jest.fn();
  UIDataSaver.loadSession = jest.fn(() => null);
  UIDataSaver.clearAll = jest.fn();
  UIDataSaver.saveApiResponse = jest.fn();
  UIDataSaver.getChartData = jest.fn(() => null);
  UIDataSaver.getAnalysisData = jest.fn(() => null);
  UIDataSaver.getBirthData = jest.fn(() => null);
  UIDataSaver.hasCompleteSession = jest.fn(() => false);

  // Default UIToAPIDataInterpreter mock implementation (class instance methods)
  UIToAPIDataInterpreter.prototype.validateAndFormat = jest.fn((data) => ({
    isValid: true,
    validatedData: data,
    formatted: true,
    apiRequest: {
      ...data,
      formatted: true
    },
    errors: []
  }));

  UIToAPIDataInterpreter.prototype.validateInput = jest.fn((data) => ({
    isValid: true,
    validatedData: data,
    errors: []
  }));

  UIToAPIDataInterpreter.prototype.formatForAPI = jest.fn((data) => ({
    apiRequest: {
      ...data,
      formatted: true
    },
    metadata: {}
  }));

  UIToAPIDataInterpreter.prototype.createRequestBody = jest.fn((data) => ({
    ...data,
    formatted: true
  }));

  UIToAPIDataInterpreter.prototype.handleErrors = jest.fn((error) => ({
    userMessage: 'Test error message',
    technicalDetails: error,
    recoverySuggestions: ['Try again']
  }));

  // Default geocoding service mock
  geocodingService.geocodeLocation.mockImplementation((location) => {
    if (location === 'Invalid Location') {
      return Promise.reject(new Error('Geocoding failed'));
    }
    return Promise.resolve({
      success: true,
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 'Asia/Kolkata'
    });
  });
});

describe('BirthDataForm', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders all form fields correctly', () => {
    render(<BirthDataForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
  });

  test('shows optional label for name field', () => {
    render(<BirthDataForm onSubmit={jest.fn()} />);

    const nameLabel = screen.getByText(/name/i).closest('label');
    expect(nameLabel).toHaveTextContent('(Optional)');
  });

  test('shows required asterisk for required fields', () => {
    render(<BirthDataForm onSubmit={jest.fn()} />);

    expect(screen.getByText(/date of birth/i).closest('label')).toHaveTextContent('*');
    expect(screen.getByText(/time of birth/i).closest('label')).toHaveTextContent('*');
    expect(screen.getByText(/place of birth/i).closest('label')).toHaveTextContent('*');
  });

  test('calls geocoding service when place of birth is entered', async () => {
    const mockGeocodingResult = {
      success: true,
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 'Asia/Kolkata',
      formatted: 'Pune, Maharashtra, India'
    };

    geocodingService.geocodeLocation.mockResolvedValue(mockGeocodingResult);

    render(<BirthDataForm onSubmit={jest.fn()} />);

    const placeInput = screen.getByLabelText(/place of birth/i);

    // Type a location
    await userEvent.type(placeInput, 'Pune, India');

    // Wait for debounced geocoding
    await waitFor(() => {
      expect(geocodingService.geocodeLocation).toHaveBeenCalledWith('Pune, India');
    }, { timeout: 2000 });

    // Check if coordinates are displayed
    await waitFor(() => {
      expect(screen.getByText(/location found/i)).toBeInTheDocument();
      expect(screen.getByText(/18.5204/)).toBeInTheDocument();
      expect(screen.getByText(/73.8567/)).toBeInTheDocument();
    });
  });

  test('shows error when geocoding fails', async () => {
    const mockGeocodingError = {
      success: false,
      error: 'Location not found',
      suggestions: ['Try adding more details']
    };

    geocodingService.geocodeLocation.mockResolvedValue(mockGeocodingError);

    render(<BirthDataForm onSubmit={jest.fn()} />);

    const placeInput = screen.getByLabelText(/place of birth/i);
    await userEvent.type(placeInput, 'Invalid Location');

    await waitFor(() => {
      expect(screen.getByText('Location not found')).toBeInTheDocument();
      expect(screen.getByText('Try adding more details')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('disables submit button when coordinates are not available', () => {
    render(<BirthDataForm onSubmit={jest.fn()} />);

    const submitButton = screen.getByRole('button', { name: /generate vedic chart/i });
    expect(submitButton).toBeDisabled();
  });

  test('enables submit button when all required fields are filled and coordinates are available', async () => {
    const mockGeocodingResult = {
      success: true,
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 'Asia/Kolkata'
    };

    geocodingService.geocodeLocation.mockResolvedValue(mockGeocodingResult);

    render(<BirthDataForm onSubmit={jest.fn()} />);

    // Fill all required fields
    await userEvent.type(screen.getByLabelText(/date of birth/i), '1985-10-24');
    await userEvent.type(screen.getByLabelText(/time of birth/i), '14:30');
    await userEvent.type(screen.getByLabelText(/place of birth/i), 'Pune, India');

    // Wait for geocoding to complete
    await waitFor(() => {
      expect(screen.getByText(/location found/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    const submitButton = screen.getByRole('button', { name: /generate vedic chart/i });
    expect(submitButton).toBeEnabled();
  });

  test('submits form with correct data', async () => {
    const mockOnSubmit = jest.fn();
    const mockGeocodingResult = {
      success: true,
      latitude: 18.5204,
      longitude: 73.8567,
      timezone: 'Asia/Kolkata'
    };

    geocodingService.geocodeLocation.mockResolvedValue(mockGeocodingResult);

    render(<BirthDataForm onSubmit={mockOnSubmit} />);

    // Fill the form
    await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/date of birth/i), '1985-10-24');
    await userEvent.type(screen.getByLabelText(/time of birth/i), '14:30');
    await userEvent.type(screen.getByLabelText(/place of birth/i), 'Pune, India');
    await userEvent.selectOptions(screen.getByLabelText(/gender/i), 'male');

    // Wait for geocoding
    await waitFor(() => {
      expect(screen.getByText(/location found/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /generate vedic chart/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        apiRequest: expect.objectContaining({
          name: 'Test User',
          dateOfBirth: '1985-10-24',
          timeOfBirth: '14:30',
          placeOfBirth: 'Pune, India',
          gender: 'male',
          latitude: 18.5204,
          longitude: 73.8567,
          timezone: 'Asia/Kolkata',
          formatted: true
        }),
        formatted: true,
        metadata: expect.any(Object)
      }));
    });
  });

  test('clears form when clear button is clicked', async () => {
    render(<BirthDataForm onSubmit={jest.fn()} />);

    // Fill some fields
    await userEvent.type(screen.getByLabelText(/name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/date of birth/i), '1985-10-24');

    // Click clear button
    const clearButton = screen.getByRole('button', { name: /clear/i });
    await userEvent.click(clearButton);

    // Check if fields are cleared
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/date of birth/i)).toHaveValue('');
  });

  test('loads saved session data on mount', async () => {
    const mockSavedData = {
      birthData: {
        name: 'Saved User',
        dateOfBirth: '1990-01-01',
        timeOfBirth: '10:00',
        placeOfBirth: 'Mumbai, India'
      },
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata'
      }
    };

    // Create a custom mock for this specific test
    const mockLoadSession = jest.fn(() => mockSavedData);
    UIDataSaver.loadSession = mockLoadSession;
    UIDataSaver.saveSession = jest.fn();
    UIDataSaver.clearAll = jest.fn();

    render(<BirthDataForm onSubmit={jest.fn()} />);

    // The form should have loaded the saved data
    expect(mockLoadSession).toHaveBeenCalled();

    // Wait for the state to update
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('Saved User');
      expect(screen.getByLabelText(/date of birth/i)).toHaveValue('1990-01-01');
      expect(screen.getByLabelText(/time of birth/i)).toHaveValue('10:00');
      expect(screen.getByLabelText(/place of birth/i)).toHaveValue('Mumbai, India');
    });
  });

  test('handles validation errors correctly', async () => {
    // Create a custom mock for this test that returns validation errors
    UIToAPIDataInterpreter.mockImplementation(() => ({
      validateInput: jest.fn(() => ({
        isValid: false,
        validatedData: {},
        errors: [
          { field: 'dateOfBirth', message: 'Date of birth is required' },
          { field: 'timeOfBirth', message: 'Time of birth is required' }
        ]
      })),
      formatForAPI: jest.fn(),
      handleErrors: jest.fn()
    }));

    render(<BirthDataForm onSubmit={jest.fn()} />);

    // Set place of birth to get coordinates
    const placeInput = screen.getByLabelText(/place of birth/i);

    // Use userEvent for better simulation of user interaction
    await userEvent.clear(placeInput);
    await userEvent.type(placeInput, 'Pune');

    // Wait for geocoding to complete
    await waitFor(() => {
      expect(screen.getByText(/Location found/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /generate vedic chart/i });
    fireEvent.click(submitButton);

    // Check if errors are displayed
    await waitFor(() => {
      // Check for specific error messages directly
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
      expect(screen.getByText('Time of birth is required')).toBeInTheDocument();
    });
  });
});
