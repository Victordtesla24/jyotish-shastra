/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GenericSection from './GenericDataRenderer';

describe('GenericDataRenderer (GenericSection)', () => {
  const mockSection = {
    id: 'generic',
    title: 'Generic Test',
    icon: '🧪',
  };

  it('renders a title for the section', () => {
    render(<GenericSection section={mockSection} data={{}} />);
    expect(screen.getByRole('heading', { name: /Generic Test Analysis/i })).toBeInTheDocument();
  });

  it('handles null and undefined data gracefully', () => {
    const { rerender } = render(<GenericSection section={mockSection} data={{ value: null }} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();

    rerender(<GenericSection section={mockSection} data={{ value: undefined }} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('renders simple key-value pairs', () => {
    const testData = {
      string_value: 'Hello World',
      number_value: 123,
      boolean_value: true,
    };
    render(<GenericSection section={mockSection} data={testData} />);

    expect(screen.getByText(/String Value:/i)).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();

    expect(screen.getByText(/Number Value:/i)).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();

    expect(screen.getByText(/Boolean Value:/i)).toBeInTheDocument();
    expect(screen.getByText('true')).toBeInTheDocument();
  });

  it('renders nested objects recursively', () => {
    const testData = {
      level1: {
        level2: 'Nested Value',
      },
    };
    render(<GenericSection section={mockSection} data={testData} />);
    expect(screen.getByText(/Level1:/i)).toBeInTheDocument();
    expect(screen.getByText(/Level2:/i)).toBeInTheDocument();
    expect(screen.getByText('Nested Value')).toBeInTheDocument();
  });

  it('renders arrays of primitives', () => {
    const testData = {
      tags: ['Vedic', 'Astrology', 'React'],
    };
    render(<GenericSection section={mockSection} data={testData} />);
    expect(screen.getByText('Vedic')).toBeInTheDocument();
    expect(screen.getByText('Astrology')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders arrays of objects', () => {
    const testData = {
      planets: [
        { name: 'Sun', sign: 'Leo' },
        { name: 'Moon', sign: 'Cancer' },
      ],
    };
    render(<GenericSection section={mockSection} data={testData} />);
    expect(screen.getAllByText(/Name:/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Sign:/i)[0]).toBeInTheDocument();

    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Leo')).toBeInTheDocument();
    expect(screen.getByText('Moon')).toBeInTheDocument();
    expect(screen.getByText('Cancer')).toBeInTheDocument();
  });

  it('formats keys correctly (snake_case and camelCase)', () => {
    const testData = {
      snake_case_key: 'value1',
      camelCaseKey: 'value2',
    };
    render(<GenericSection section={mockSection} data={testData} />);
    expect(screen.getByText(/Snake Case Key:/i)).toBeInTheDocument();
    expect(screen.getByText(/Camel Case Key:/i)).toBeInTheDocument();
  });
});
