describe('UI Smoke Tests', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display the header, main content area, and footer', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });

    it('should display the homepage content and navigation', () => {
        // Check for hero section
        cy.get('.hero').should('be.visible');
        cy.get('h1').should('contain', 'Expert-Level Vedic Kundli Analysis');

        // Check for navigation buttons
        cy.get('a[href="/chart"]').should('be.visible').and('contain', 'Generate Birth Chart');
        cy.get('a[href="/analysis"]').should('be.visible').and('contain', 'Learn More');

        // Check for features section
        cy.get('.features').should('be.visible');
        cy.get('.feature-card').should('have.length', 6);
    });
});
