/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnhancedPersonalityProfile from './EnhancedPersonalityProfile';
import rawAnalysisData from '../../../../tests/test-data/comprehensive_analysis_response.json';

// Mock child components to isolate the main component's logic
jest.mock('../ui/loading/VedicLoadingSpinner', () => () => <div data-testid="loading-spinner">Loading...</div>);

describe('EnhancedPersonalityProfile', () => {
    it('renders a loading skeleton when isLoading is true', () => {
        render(<EnhancedPersonalityProfile isLoading={true} />);
        expect(screen.getByTestId('skeleton-profile')).toBeInTheDocument();
    });

    it('renders a "no data" message when analysisData is null or invalid', () => {
        render(<EnhancedPersonalityProfile analysisData={null} />);
        expect(screen.getByText(/No Analysis Data Available/i)).toBeInTheDocument();
    });

    it('renders the main title and section buttons with valid data', () => {
        render(<EnhancedPersonalityProfile analysisData={rawAnalysisData} />);

        // Check for the main heading
        expect(screen.getByRole('heading', { name: /Personality Illumination/i })).toBeInTheDocument();

        // Check for section buttons
        expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Ascendant/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Moon/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sun/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Remedies/i })).toBeInTheDocument();
    });

    it('displays the correct section when a button is clicked', () => {
        render(<EnhancedPersonalityProfile analysisData={rawAnalysisData} />);

        // Initially, Overview section should be visible, which renders "Your Cosmic Blueprint"
        expect(screen.getByRole('heading', { name: /Your Cosmic Blueprint/i })).toBeInTheDocument();

        // Click on the 'Ascendant' button
        const ascendantButton = screen.getByRole('button', { name: /Ascendant/i });
        fireEvent.click(ascendantButton);

        // Now, the LagnaSection should be rendered, which contains the Ascendant sign
        // The test data has "Pisces" as the ascendant sign.
        expect(screen.getByRole('heading', { name: /Pisces Ascendant/i })).toBeInTheDocument();
        expect(screen.getByText(/Intuitive and spiritual/i)).toBeInTheDocument(); // Check for description as substring

        // Click on the 'Remedies' button
        const remediesButton = screen.getByRole('button', { name: /Remedies/i });
        fireEvent.click(remediesButton);

        // Now, the RecommendationsSection should be rendered
        expect(screen.getByRole('heading', { name: /Sacred Remedies & Recommendations/i })).toBeInTheDocument();
        // Check for a specific recommendation with a more precise query
        expect(screen.getByRole('heading', { name: /^Recommendation$/i })).toBeInTheDocument();
    });
});
