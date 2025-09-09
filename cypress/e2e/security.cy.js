describe('Security and access control', () => {
  const base = 'http://127.0.0.1:8111';
  const email = 'test@dev.com';
  const code = '111111';

  before(() => {
    cy.request('POST', `${base}/router.php?controller=seeder`, { action: 'reset_schema', schema: 'wt_test' });
    cy.request('POST', `${base}/router.php?controller=schema`, { action: 'switch', schema: 'wt_test' });
  });

  it('unauthenticated: login router accessible, profile endpoints blocked', () => {
    cy.request('POST', `${base}/login_router.php?controller=auth`, { action: 'send_login_code', email })
      .its('status').should('eq', 200);

    cy.request({
      method: 'POST',
      url: `${base}/router.php?controller=profile`,
      body: { action: 'get_profile' },
      failOnStatusCode: false,
    }).then((resp) => {
      expect([401,403]).to.include(resp.status);
    });
  });

  it('after login: profile endpoints accessible', () => {
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'send_login_code', email } })
      .its('status').should('eq', 200);
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'peek_code', email } }).then((resp) => {
      const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
      expect(body.success).to.eq(true);
      const code = body.code || '111111';
      cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'verify_login', email, code } })
      .then((resp) => {
        const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        expect(body.success).to.eq(true);
      });
    });

    cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, body: { action: 'get_profile' } })
      .its('status').should('eq', 200);
  });
});
