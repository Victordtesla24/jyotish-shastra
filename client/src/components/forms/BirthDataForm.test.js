import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BirthDataForm from './BirthDataForm';

describe('BirthDataForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', () => {
    render(<BirthDataForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/place of birth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/latitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/longitude/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time zone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(<BirthDataForm onSubmit={mockOnSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: /generate chart/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/date of birth is required/i)).toBeInTheDocument();
    expect(screen.getByText(/time of birth is required/i)).toBeInTheDocument();
    expect(screen.getByText(/place of birth is required if coordinates are not provided/i)).toBeInTheDocument();
    expect(screen.getByText(/time zone is required/i)).toBeInTheDocument();
  });

  it('shows validation error for future date of birth', async () => {
    render(<BirthDataForm onSubmit={mockOnSubmit} />);

    const dateInput = screen.getByLabelText(/date of birth/i);

    await userEvent.type(dateInput, '2099-01-01');
    fireEvent.blur(dateInput);

    await waitFor(() => {
      expect(screen.getByText(/date of birth must be in the past/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data when valid', async () => {
    render(<BirthDataForm onSubmit={mockOnSubmit} />);

    await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
    await userEvent.type(screen.getByLabelText(/date of birth/i), '1990-01-01');
    await userEvent.type(screen.getByLabelText(/time of birth/i), '12:00');
    await userEvent.type(screen.getByLabelText(/place of birth/i), 'Test City');
    await userEvent.selectOptions(screen.getByLabelText(/time zone/i), '5.5');
    await userEvent.selectOptions(screen.getByLabelText(/gender/i), 'male');

    await userEvent.click(screen.getByRole('button', { name: /generate chart/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          date: '1990-01-01',
          time: '12:00',
          placeOfBirth: 'Test City',
          timezone: '5.5',
          gender: 'male',
        }),
        expect.anything()
      );
    });
  });
});
