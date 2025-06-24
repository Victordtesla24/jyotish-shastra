describe('Refactored Chart Generation Workflow', () => {
  beforeEach(() => {
    cy.fixture('sample-birth-data.json').as('birthData');
  });

  it('should allow a user to fill out the form, submit, and see the analysis', function() {
    // Mock the API response with proper comprehensive chart data structure
    const mockComprehensiveData = {
      birthData: this.birthData.testCases[0].birthData,
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
      }
    };

    cy.intercept('POST', '/api/chart/generate/comprehensive', {
      delay: 2000, // Increase delay to 2 seconds to ensure loading state is visible
      body: {
        success: true,
        data: mockComprehensiveData
      }
    }).as('generateChart');

    cy.visit('/chart');

    const birthData = this.birthData.testCases[0].birthData;

    // Fill out the form - using correct field names
    cy.get('input[name="name"]').type(this.birthData.testCases[0].name);
    cy.get('input[name="date"]').type(birthData.dateOfBirth);
    cy.get('input[name="time"]').type(birthData.timeOfBirth);
    cy.get('#placeOfBirth').type(birthData.placeOfBirth.name);
    // Convert IANA timezone to UTC offset - Asia/Kolkata = UTC+5:30 = "5.5"
    const timezoneValue = birthData.placeOfBirth.timezone === 'Asia/Kolkata' ? '5.5' : '0';
    cy.get('select[name="timezone"]').select(timezoneValue);
    cy.get('select[name="gender"]').select('male');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify that the API call is initiated (loading state should appear)
    // Check for either the loading spinner overlay or the loading text on the button
    cy.get('body').should('satisfy', ($body) => {
      return $body.find('.loading-spinner-overlay').length > 0 ||
             $body.find('button:contains("Generating")').length > 0;
    });

    // Wait for the API call to complete
    cy.wait('@generateChart').its('response.statusCode').should('eq', 200);

    // Verify loading is done
    cy.get('.loading-spinner-overlay').should('not.exist');
    cy.get('button').should('not.contain', 'Generating');

    // Verify that the analysis display is visible
    cy.get('.chart-display').should('be.visible');
    cy.contains('h3', 'Birth Details').should('be.visible');
  });
});
