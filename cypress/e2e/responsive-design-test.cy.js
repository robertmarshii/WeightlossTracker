describe('Responsive Design Testing', () => {
  const viewports = [
    { name: 'Mobile Portrait', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  viewports.forEach(viewport => {
    describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        cy.viewport(viewport.width, viewport.height);
        cy.visit('http://localhost:8111');
      });

      it('should display login page elements properly', () => {
        // Test glass card visibility and positioning
        cy.get('.glass-card').should('be.visible');

        // Test logo section
        cy.get('.logo-section').should('be.visible');
        cy.get('.logo-icon').should('be.visible');
        cy.get('.logo-text').should('be.visible');

        // Test welcome text
        cy.get('.welcome-title').should('be.visible');
        cy.get('.welcome-subtitle').should('be.visible');

        // Test form elements
        cy.get('#email').should('be.visible');
        cy.get('button[type="submit"]').should('be.visible');

        // Test navigation tabs
        cy.get('.nav-tabs').should('be.visible');
        cy.get('.nav-link').should('be.visible');

        // Check for horizontal overflow
        cy.window().then((win) => {
          expect(win.document.body.scrollWidth).to.be.at.most(viewport.width + 20); // Allow small tolerance
        });
      });

      it('should test dashboard responsiveness after login', () => {
        // Quick login
        cy.get('#email').type('test@example.com');
        cy.get('button[type="submit"]').click();
        cy.get('#verification-code').type('123456');
        cy.get('button[type="submit"]').click();

        // Wait for dashboard to load
        cy.url().should('include', 'dashboard.php');

        // Test dashboard elements
        cy.get('.glass-card-small').should('be.visible');
        cy.get('.welcome-title').should('be.visible');

        // Test navigation
        cy.get('.nav-tabs').should('be.visible');

        // Test responsive behavior of glass cards
        cy.get('.glass-card-small').each(($card) => {
          cy.wrap($card).should('be.visible');
          cy.wrap($card).invoke('outerWidth').should('be.at.most', viewport.width);
        });

        // Check for horizontal overflow on dashboard
        cy.window().then((win) => {
          expect(win.document.body.scrollWidth).to.be.at.most(viewport.width + 20);
        });
      });

      it('should test form elements on different screen sizes', () => {
        // Test input field responsiveness
        cy.get('#email').should('be.visible').then(($input) => {
          const inputWidth = $input.outerWidth();
          const containerWidth = $input.parent().outerWidth();
          expect(inputWidth).to.be.at.most(containerWidth);
        });

        // Test button responsiveness
        cy.get('button[type="submit"]').should('be.visible').then(($button) => {
          const buttonWidth = $button.outerWidth();
          const containerWidth = $button.parent().outerWidth();
          expect(buttonWidth).to.be.at.most(containerWidth);
        });
      });
    });
  });

  describe('Responsive Issues Detection', () => {
    it('should identify current responsive issues', () => {
      const issues = [];

      [375, 768, 1024].forEach(width => {
        cy.viewport(width, 667);
        cy.visit('http://localhost:8111');

        // Check for common responsive issues
        cy.get('body').then(() => {
          // Check for horizontal scroll
          cy.window().then((win) => {
            if (win.document.body.scrollWidth > width) {
              issues.push(`Horizontal overflow at ${width}px width`);
            }
          });

          // Check if glass card is too wide on mobile
          if (width <= 768) {
            cy.get('.glass-card').then(($card) => {
              if ($card.outerWidth() > width - 40) { // 40px for margins
                issues.push(`Glass card too wide on ${width}px screen`);
              }
            });
          }

          // Check navigation visibility on small screens
          if (width <= 375) {
            cy.get('.nav-tabs .nav-link').then(($links) => {
              if ($links.length > 2) {
                const totalWidth = Array.from($links).reduce((sum, link) => sum + link.offsetWidth, 0);
                if (totalWidth > width - 40) {
                  issues.push(`Navigation tabs overflow on ${width}px screen`);
                }
              }
            });
          }
        });
      });

      // Log issues found (this will help us understand what to fix)
      if (issues.length > 0) {
        cy.log('Responsive issues detected:', issues.join(', '));
      }
    });
  });
});