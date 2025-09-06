describe('App smoke tests', () => {
  it('loads the index page', () => {
    cy.visit('/');
    cy.title().should('be.a', 'string');
    cy.document().its('contentType').should('include', 'text/html');
  });

  it('API get1 returns valid JSON', () => {
    cy.request('/router.php?controller=get1').then((resp) => {
      expect(resp.status).to.eq(200);
      // Content-Type may not be set; validate body parses as JSON
      expect(() => JSON.parse(resp.body)).not.to.throw();
      const data = JSON.parse(resp.body);
      expect(data).to.be.an('array');
    });
  });
});

