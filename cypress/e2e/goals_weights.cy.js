describe('Goals and weights', () => {
  const base = 'http://127.0.0.1:8111';
  const email = 'test1@example.com';
  const code = '111111';

  before(() => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=seeder`, form: true, body: { action: 'reset_schema', schema: 'wt_test' } });
  });

  beforeEach(() => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'switch', schema: 'wt_test' } })
      .then(() => cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'send_login_code', email } }))
      .then(() => cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'peek_code', email } }))
      .then((resp) => {
        const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        const code = body.code || '111111';
        return cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'verify_login', email, code } });
      });
  });

  it('adds weight and sets goal', () => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'switch', schema: 'wt_test' } })
      .then(() => cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'send_login_code', email } }))
      .then(() => cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'peek_code', email } }))
      .then((resp) => {
        const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        const code = body.code || '111111';
        return cy.request({ method: 'POST', url: `${base}/login_router.php?controller=auth`, form: true, body: { action: 'verify_login', email, code } });
      })
      .then(() => cy.getCookie('PHPSESSID')).then((c) => {
        const headers = c ? { Cookie: `PHPSESSID=${c.value}` } : undefined;
        cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, headers, body: { action: 'add_weight', weight_kg: 78.5 } }).its('status').should('eq', 200);
        cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, headers, body: { action: 'get_latest_weight' } }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(parseFloat(body.latest.weight_kg)).to.be.greaterThan(0);
        });

        cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, headers, body: { action: 'save_goal', target_weight_kg: 72.0, target_date: '2025-12-31' } }).its('status').should('eq', 200);
        cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, headers, body: { action: 'get_goal' } }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(parseFloat(body.goal.target_weight_kg)).to.eq(72.0);
        });
      });
  });
});
