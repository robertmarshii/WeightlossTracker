describe('Auth negative cases', () => {
  const base = 'http://127.0.0.1:8111';
  const goodEmail = 'test@dev.com';

  before(() => {
    cy.request('POST', `${base}/router.php?controller=seeder`, { action: 'reset_schema', schema: 'wt_test' });
    cy.request('POST', `${base}/router.php?controller=schema`, { action: 'switch', schema: 'wt_test' });
  });

  it('rejects wrong login code', () => {
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'send_login_code', email: goodEmail } }).its('status').should('eq', 200);
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'peek_code', email: goodEmail } }).then((peek) => {
      const p = typeof peek.body === 'string' ? JSON.parse(peek.body) : peek.body;
      const correct = (p && p.code) || '111111';
      // Generate a wrong code by altering the last digit
      const wrong = correct.slice(0, 5) + ((parseInt(correct.slice(5)) + 1) % 10).toString();
      cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'verify_login', email: goodEmail, code: wrong } }).then((resp) => {
        const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        expect(body.success).to.eq(false);
        expect((body.message || '').toLowerCase()).to.contain('invalid');
      });
    });
  });

  it('rejects account creation with invalid email', () => {
    cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'create_account', first_name: 'X', last_name: 'Y', email: 'not-an-email' } }).then((resp) => {
      const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
      expect(body.success).to.eq(false);
      expect((body.message || '').toLowerCase()).to.contain('invalid');
    });
  });
});
