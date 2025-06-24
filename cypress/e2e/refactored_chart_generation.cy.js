describe('Refactored Chart Generation Workflow', () => {
  beforeEach(() => {
    cy.fixture('sample-birth-data.json').as('birthData');
  });

  it('should allow a user to fill out the form, submit, and see the analysis', function() {
    // Mock the API response with delay to capture loading state
    cy.intercept('POST', '/api/chart/generate/comprehensive', {
      delay: 1000, // Add 1 second delay to ensure loading state is visible
      body: {
        success: true,
        data: this.birthData.testCases[0]
      }
    }).as('generateChart');

    cy.visit('/chart');

    const birthData = this.birthData.testCases[0].birthData;

    // Fill out the form - using correct field names
    cy.get('input[name="name"]').type(this.birthData.testCases[0].name);
    cy.get('input[name="date"]').type(birthData.dateOfBirth);
    cy.get('input[name="time"]').type(birthData.timeOfBirth);
    cy.get('#placeOfBirth').type(birthData.placeOfBirth.name);
    cy.get('select[name="timezone"]').select(birthData.placeOfBirth.timezone);
    cy.get('select[name="gender"]').select('male');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify loading state and successful API call
    cy.get('.loading-spinner-overlay').should('be.visible');
    cy.wait('@generateChart').its('response.statusCode').should('eq', 200);
    cy.get('.loading-spinner-overlay').should('not.exist');

    // Verify that the analysis display is visible
    cy.get('.chart-display').should('be.visible');
    cy.contains('h3', 'Birth Details').should('be.visible');
  });
});
