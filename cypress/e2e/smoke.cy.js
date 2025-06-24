describe('UI Smoke Tests', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should display the header, main content area, and footer', () => {
        cy.get('header').should('be.visible');
        cy.get('main').should('be.visible');
        cy.get('footer').should('be.visible');
    });

    it('should display the birth data form', () => {
        cy.get('form').should('be.visible');
        cy.get('input[name="dateOfBirth"]').should('be.visible');
        cy.get('input[name="timeOfBirth"]').should('be.visible');
        cy.get('input[name="placeOfBirth"]').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
    });
});
