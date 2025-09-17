describe('App smoke tests', () => {
  beforeEach(() => {
    // Set cypress_testing cookie to disable rate limiting for tests
    cy.setCookie('cypress_testing', 'true');

    // Clear any existing rate limits for test email
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:8111/router.php?controller=email',
      body: {
        action: 'clear_rate_limits',
        email: 'test@dev.com'
      },
      failOnStatusCode: false
    });
  });

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

