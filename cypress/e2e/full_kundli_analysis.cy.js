// This test is written in a style similar to Cypress or Playwright.
// It requires a running instance of the full application (frontend and backend).

describe('End-to-End Test: Full Kundli Analysis', () => {

  beforeEach(() => {
    // Visit the application's homepage before each test
    cy.visit('/');
  });

  it('should allow a user to enter birth data, generate a report, and view the analysis', () => {
    // 1. Navigate to the analysis page and fill out the form
    cy.get('nav .nav-link[href="/analysis"]').click();
    cy.get('input[name="name"]').type('John Doe');
    cy.get('input[name="date"]').type('1990-05-15');
    cy.get('input[name="time"]').type('10:30');
    cy.get('input[name="latitude"]').type('34.0522');
    cy.get('input[name="longitude"]').type('-118.2437');
    cy.get('select[name="timezone"]').select('-7');

    // 2. Submit the form
    cy.get('button[type="submit"]').click();

    // 3. Wait for the analysis to complete and the report page to load
    // The URL should now be something like /report/:id
    cy.url().should('include', '/report/');
    cy.get('.loading-spinner').should('not.exist'); // Wait for loading to finish

    // 4. Validate the displayed report content
    cy.get('h1').should('contain', 'Comprehensive Vedic Astrology Report for John Doe');

    // 5. Navigate through the report sections and verify content

    // Check Personality Profile
    cy.get('#personality-profile').should('be.visible');
    cy.get('#personality-profile .content').should('contain', 'Aries Lagna');

    // Click to view Career Analysis
    cy.get('nav .tab[data-target="career"]').click();
    cy.get('#career-analysis').should('be.visible');
    cy.get('#career-analysis .content').should('contain', '10th house');

    // Click to view Relationship Analysis
    cy.get('nav .tab[data-target="relationships"]').click();
    cy.get('#relationship-analysis').should('be.visible');
    cy.get('#relationship-analysis .content').should('contain', '7th house');

    // Check Dasha timeline
     cy.get('nav .tab[data-target="timeline"]').click();
    cy.get('#timeline-analysis').should('be.visible');
    cy.get('#timeline-analysis .dasha-period').should('have.length.greaterThan', 5);
  });

  it('should display an error message for invalid birth data submission', () => {
    cy.get('nav .nav-link[href="/analysis"]').click();

    // Submit form with missing data
    cy.get('button[type="submit"]').click();

    // Assert that an error message is displayed
    cy.get('.error-message').should('be.visible');
    cy.get('.error-message').should('contain', 'Please fill out all required fields.');

    // Assert that we are still on the analysis page
    cy.url().should('include', '/analysis');
  });

});
