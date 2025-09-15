describe('Responsive Design Validation', () => {
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 }
  ];

  devices.forEach(device => {
    describe(`${device.name} (${device.width}x${device.height})`, () => {
      beforeEach(() => {
        cy.viewport(device.width, device.height);
        cy.visit('http://localhost:8111');
      });

      it('should display login page without horizontal overflow', () => {
        // Check for horizontal overflow
        cy.window().then((win) => {
          expect(win.document.body.scrollWidth).to.be.at.most(device.width + 5);
        });

        // Verify main elements are visible
        cy.get('.glass-card').should('be.visible');
        cy.get('.logo-icon').should('be.visible');
        cy.get('.welcome-title').should('be.visible');
        cy.get('#email').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');
      });

      it('should have properly sized elements', () => {
        // Glass card should not exceed viewport width minus some margin
        cy.get('.glass-card').then(($card) => {
          expect($card.outerWidth()).to.be.at.most(device.width - 10);
        });

        // Input should be responsive
        cy.get('#email').then(($input) => {
          expect($input.outerWidth()).to.be.at.most(device.width - 50);
        });

        // Button should be responsive
        cy.get('button[type="submit"]').then(($button) => {
          expect($button.outerWidth()).to.be.at.most(device.width - 50);
        });
      });

      it('should test dashboard responsiveness', () => {
        // Quick login to dashboard
        cy.get('#email').type('test@example.com');
        cy.get('button[type="submit"]').click();
        cy.get('#verification-code').type('123456');
        cy.get('button[type="submit"]').click();

        // Wait for dashboard
        cy.url().should('include', 'dashboard.php');

        // Check dashboard elements
        cy.get('.glass-card-small').should('be.visible');

        // Dashboard should not have horizontal overflow
        cy.window().then((win) => {
          expect(win.document.body.scrollWidth).to.be.at.most(device.width + 5);
        });

        // Dashboard cards should fit properly
        cy.get('.glass-card-small').each(($card) => {
          cy.wrap($card).invoke('outerWidth').should('be.at.most', device.width - 10);
        });
      });
    });
  });

  describe('Touch targets for mobile', () => {
    it('should have adequate touch targets on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('http://localhost:8111');

      // Buttons should be at least 44px tall (Apple's recommendation)
      cy.get('button[type="submit"]').then(($button) => {
        expect($button.outerHeight()).to.be.at.least(40);
      });

      // Input fields should be tall enough
      cy.get('#email').then(($input) => {
        expect($input.outerHeight()).to.be.at.least(40);
      });

      // Navigation links should be touch-friendly
      cy.get('.nav-link').each(($link) => {
        cy.wrap($link).invoke('outerHeight').should('be.at.least', 32);
      });
    });
  });
});