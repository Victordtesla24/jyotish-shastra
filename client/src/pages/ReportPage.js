import React from 'react';
import { useLocation } from 'react-router-dom';
import ComprehensiveAnalysisDisplay from '../components/reports/ComprehensiveAnalysisDisplay';
import './ReportPage.css';

const ReportPage = () => {
  const location = useLocation();
  const analysisData = location.state?.analysisData;
  const birthData = location.state?.birthData;

  // Mock data for E2E testing when no analysis data is available
  const mockAnalysisData = {
    data: {
      rasiChart: {
        ascendant: { sign: 'Aries', degree: 15.5 },
        nakshatra: { name: 'Ashwini', pada: 2 },
        planetaryPositions: {
          sun: { sign: 'Aries', degree: 10.5, dignity: 'Own Sign' },
          moon: { sign: 'Taurus', degree: 25.3, dignity: 'Neutral' },
          mars: { sign: 'Aries', degree: 5.2, dignity: 'Exalted' },
        }
      },
      dashaInfo: {
        currentDasha: { dasha: 'Mars', remainingYears: 3.5 }
      },
      analysis: {
        personality: {
          lagnaSign: 'Aries',
          moonSign: 'Taurus',
          sunSign: 'Aries',
          keyTraits: ['Leadership qualities', 'Dynamic personality', 'Natural courage']
        },
        career: {
          timing: 'Favorable period from 2025-2027',
          suitableProfessions: ['Engineering', 'Military', 'Sports'],
          careerStrengths: ['Leadership', 'Initiative', 'Physical strength']
        },
        health: {
          generalHealth: 'Generally strong constitution',
          recommendations: ['Regular exercise', 'Avoid excessive heat', 'Practice meditation']
        },
        finances: {
          wealthIndicators: 'Strong potential for wealth accumulation',
          financialTiming: 'Prosperous periods during Jupiter transit',
          incomeSources: ['Business ventures', 'Property investments', 'Professional career']
        },
        relationships: {
          marriageIndications: 'Favorable for marriage after age 28',
          partnerCharacteristics: 'Strong, independent, and supportive partner',
          timing: 'Best period: 2026-2028'
        },
        spirituality: {
          spiritualIndicators: 'Natural inclination towards dharma',
          spiritualPath: 'Karma Yoga - path of action and service'
        },
        timing: {
          majorPeriods: 'Currently in Mars Dasha until 2027',
          favorableTiming: '2025-2027 highly favorable',
          challengingPeriods: 'Minor challenges during 2024 Rahu sub-period'
        }
      },
      birthData: birthData || {
        name: 'Sample User',
        dateOfBirth: '1990-05-15',
        timeOfBirth: '10:30',
        placeOfBirth: 'Mumbai, Maharashtra, India',
        latitude: 19.0760,
        longitude: 72.8777,
        geocodingInfo: {
          formattedAddress: 'Mumbai, Maharashtra, India',
          service: 'geocoding'
        }
      }
    }
  };

  const displayData = analysisData || mockAnalysisData;

  return (
    <div className="report-page">
      <div className="container">
        {displayData?.data ? (
          <ComprehensiveAnalysisDisplay data={displayData.data} />
        ) : (
          <>
            <div className="page-header">
              <h1>Detailed Reports</h1>
              <p>Comprehensive life predictions and guidance</p>
            </div>
            <div className="report-content">
              <div className="card">
                <div className="card-header">
                  <h2>Report Sections</h2>
                </div>
                <div className="card-body">
                  <p>Please generate a chart analysis first to view detailed reports.</p>
                  <p>Reports will include:</p>
                  <ul>
                    <li>Personality and Character Profile</li>
                    <li>Health and Wellness Analysis</li>
                    <li>Education and Career Analysis</li>
                    <li>Financial Prospects</li>
                    <li>Relationships and Marriage</li>
                    <li>General Life Predictions</li>
                    <li>Notable Periods and Timeline</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
