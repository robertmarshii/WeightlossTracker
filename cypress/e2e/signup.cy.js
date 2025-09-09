describe('Signup and first login', () => {
  const base = 'http://127.0.0.1:8111';
  const email = `e2e+${Date.now()}@dev.com`;
  const code = '111111';

  before(() => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=seeder`, form: true, body: { action: 'reset_schema', schema: 'wt_test' } });
    cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'switch', schema: 'wt_test' } });
  });

  it('creates account and verifies, then can login', () => {
    // Create account (deterministic code should be issued for e2e+*@dev.com)
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'create_account', first_name: 'E2E', last_name: 'User', email } }).then((resp) => {
      const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
      expect(body.success).to.eq(true);
    });

    // Verify signup
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'peek_code', email } }).then((peek) => {
      const p = typeof peek.body === 'string' ? JSON.parse(peek.body) : peek.body;
      const code = p.code || '111111';
      cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'verify_signup', email, code } }).then((resp) => {
        const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        expect(body.success).to.eq(true);
      });
    });

    // Logout
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'logout' } }).its('status').should('eq', 200);
    // New session after logout loses selected schema; switch again to wt_test
    cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'switch', schema: 'wt_test' } }).its('status').should('eq', 200);

    // Can login with deterministic code
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'send_login_code', email } }).its('status').should('eq', 200);
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'peek_code', email } }).then((peek) => {
      const p = typeof peek.body === 'string' ? JSON.parse(peek.body) : peek.body;
      const code = p.code || '111111';
      cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'verify_login', email, code } }).then((resp) => {
        const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        expect(body.success).to.eq(true);
      });
    });
  });
});
