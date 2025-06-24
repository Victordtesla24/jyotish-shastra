import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BirthDataForm from './BirthDataForm';

describe('BirthDataForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders all form fields', async () => {
    await act(async () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} />);
    });

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
    await act(async () => {
      render(
        <>
          <BirthDataForm onSubmit={mockOnSubmit} />
          <button type="submit" form="birth-data-form">Generate Chart</button>
        </>
      );
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /generate chart/i }));
    });

    await waitFor(async () => {
      expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/date of birth is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/time of birth is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/place of birth is required if coordinates are not provided/i)).toBeInTheDocument();
      expect(await screen.findByText(/time zone is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/gender is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for future date of birth', async () => {
    await act(async () => {
      render(<BirthDataForm onSubmit={mockOnSubmit} />);
    });

    const dateInput = screen.getByLabelText(/date of birth/i);

    await act(async () => {
      await userEvent.type(dateInput, '2099-01-01');
      fireEvent.blur(dateInput);
    });

    await waitFor(async () => {
      expect(await screen.findByText(/date of birth must be in the past/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with form data when valid', async () => {
    await act(async () => {
      render(
        <>
          <BirthDataForm onSubmit={mockOnSubmit} />
          <button type="submit" form="birth-data-form">Generate Chart</button>
        </>
      );
    });

    await act(async () => {
      await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
      await userEvent.type(screen.getByLabelText(/date of birth/i), '1990-01-01');
      await userEvent.type(screen.getByLabelText(/time of birth/i), '12:00');
      await userEvent.type(screen.getByLabelText(/place of birth/i), 'Test City');
      await userEvent.type(screen.getByLabelText(/time zone/i), 'UTC');
      await userEvent.selectOptions(screen.getByLabelText(/gender/i), 'male');
    });

    await act(async () => {
      await userEvent.click(screen.getByRole('button', { name: /generate chart/i }));
    });

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test User',
          dateOfBirth: '1990-01-01',
          timeOfBirth: '12:00',
          placeOfBirth: 'Test City',
          timeZone: 'UTC',
          gender: 'male',
        }),
        expect.anything()
      );
    });
  });
});
