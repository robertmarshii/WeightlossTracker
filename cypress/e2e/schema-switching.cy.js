describe('Schema Switching Tests', () => {
  const schemas = ['wt_test', 'wt_dev', 'wt_live'];
  let originalSchema;

  before(() => {
    // Store original schema to restore after tests
    cy.request({ method: 'POST', url: '/router.php?controller=schema', form: true, body: { action: 'get' } })
      .then((resp) => {
        const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        originalSchema = data.schema;
      });
  });

  after(() => {
    // Restore original schema
    if (originalSchema) {
      cy.request({ method: 'POST', url: '/router.php?controller=schema', form: true, body: { 
        action: 'switch', 
        schema: originalSchema 
      }});
    }
  });

  it('loads the schema switcher page', () => {
    cy.visit('/test/schema-switcher.html');
    cy.contains('Schema Switcher').should('be.visible');
    cy.get('.schema-card').should('have.length', 3);
  });

  it('shows current schema status', () => {
    cy.visit('/test/schema-switcher.html');
    cy.get('.schema-card.active').should('have.length', 1);
    cy.get('.status-active').should('have.length', 1);
  });

  schemas.forEach((schema) => {
    it(`switches to ${schema} schema and validates data access`, () => {
      cy.visit('/test/schema-switcher.html');
      
      // Switch to the schema
      cy.get(`[data-schema="${schema}"]`).click();
      
      // Wait for success message
      cy.get('.alert-success').should('contain', `Schema switched to ${schema}`);
      
      // Verify visual feedback
      cy.get(`#card-${schema}`).should('have.class', 'active');
      cy.get(`#status-${schema}`).should('have.class', 'status-active');
      
      // Test connection to verify schema is working
      cy.get('#test-connection').click();
      
      // Wait for connection test result
      cy.get('#connection-result').should('be.visible');
      cy.get('#connection-result').should('not.contain', 'Connection Test Failed');
      
      // Verify API call with new schema works
      cy.request({ method: 'POST', url: '/router.php?controller=get1', form: true, body: { page: 1 } })
        .then((resp) => {
          expect(resp.status).to.eq(200);
          // Should return valid JSON (array or error message)
          expect(() => JSON.parse(resp.body)).not.to.throw();
        });
    });
  });

  it('validates schema switching API endpoints', () => {
    schemas.forEach((schema) => {
      // Test schema switching via API
      cy.request({ method: 'POST', url: '/router.php?controller=schema', form: true, body: { 
        action: 'switch', 
        schema: schema 
      }}).then((resp) => {
        expect(resp.status).to.eq(200);
        const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        expect(data.success).to.be.true;
        expect(data.message).to.contain(schema);
      });

      // Verify the schema was actually changed
      cy.request({ method: 'POST', url: '/router.php?controller=schema', form: true, body: { action: 'get' } })
        .then((resp) => {
          expect(resp.status).to.eq(200);
          const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(data.success).to.be.true;
          expect(data.schema).to.eq(schema);
        });

      // Test that data can be retrieved from new_table with current schema
      cy.request({ method: 'POST', url: '/router.php?controller=get1', form: true, body: { page: 1 } })
        .then((resp) => {
          expect(resp.status).to.eq(200);
          // Response should be valid JSON
          expect(() => JSON.parse(resp.body)).not.to.throw();
        });
    });
  });

  it('rejects invalid schema names', () => {
    cy.request({
      method: 'POST',
      url: '/router.php?controller=schema',
      form: true,
      body: { action: 'switch', schema: 'invalid_schema' },
      failOnStatusCode: false
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
      expect(data.success).to.be.false;
      expect(data.message).to.contain('Invalid schema name');
    });
  });
});
