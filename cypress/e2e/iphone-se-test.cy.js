describe('iPhone SE Layout Test', () => {
  beforeEach(() => {
    cy.viewport(375, 667); // iPhone SE dimensions
    cy.visit('http://localhost:8111');
  });

  it('should display login page properly on iPhone SE', () => {
    // Check no horizontal overflow
    cy.window().then((win) => {
      expect(win.document.body.scrollWidth).to.be.at.most(380); // Small tolerance
    });

    // Check main elements are visible and sized properly
    cy.get('.glass-card').should('be.visible').then(($card) => {
      expect($card.outerWidth()).to.be.at.most(370);
    });

    cy.get('.logo-icon').should('be.visible').then(($logo) => {
      expect($logo.outerWidth()).to.be.at.most(40);
    });

    cy.get('#email').should('be.visible').then(($input) => {
      expect($input.outerHeight()).to.be.at.least(36);
    });

    cy.get('button[type="submit"]').should('be.visible').then(($btn) => {
      expect($btn.outerHeight()).to.be.at.least(36);
    });
  });

  it('should display dashboard properly on iPhone SE', () => {
    // Login quickly
    cy.get('#email').type('test@example.com');
    cy.get('button[type="submit"]').click();
    cy.get('#verification-code').type('123456');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', 'dashboard.php');

    // Check no horizontal overflow on dashboard
    cy.window().then((win) => {
      expect(win.document.body.scrollWidth).to.be.at.most(380);
    });

    // Check dashboard cards fit properly
    cy.get('.glass-card-small').should('be.visible').each(($card) => {
      cy.wrap($card).invoke('outerWidth').should('be.at.most', 370);
    });

    // Check navigation tabs are visible and work
    cy.get('.nav-tabs .nav-link').should('be.visible');
    cy.get('#health-tab').click();
    cy.get('#health').should('be.visible');

    // Check form elements are properly sized
    cy.get('.glass-input').each(($input) => {
      cy.wrap($input).invoke('outerHeight').should('be.at.least', 32);
    });
  });

  it('should have readable text on iPhone SE', () => {
    // Check font sizes are not too small
    cy.get('.welcome-title').should('be.visible').then(($title) => {
      const fontSize = parseFloat(window.getComputedStyle($title[0]).fontSize);
      expect(fontSize).to.be.at.least(14); // Minimum readable size
    });

    cy.get('.nav-link').should('be.visible').then(($link) => {
      const fontSize = parseFloat(window.getComputedStyle($link[0]).fontSize);
      expect(fontSize).to.be.at.least(10); // Minimum for nav
    });
  });
});