describe('Profile, BMI and Health', () => {
  const base = 'http://127.0.0.1:8111';
  const email = 'test1@example.com';
  const code = '111111';

  before(() => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=seeder`, form: true, body: { action: 'reset_schema', schema: 'wt_test' } });
  });

  // Login happens inside the test to keep cookie/session within same command chain

  it('saves profile, logs weight, returns BMI and health stats', () => {
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
        cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, headers, body: {
          action: 'save_profile', height_cm: 175, body_frame: 'medium', age: 35, activity_level: 'moderate'
        }}).its('status').should('eq', 200);

        cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, headers, body: { action: 'add_weight', weight_kg: 80.0 } })
          .its('status').should('eq', 200);

        cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, headers, body: { action: 'get_bmi' } }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(body.bmi).to.be.greaterThan(20);
          expect(body.bmi).to.be.lessThan(30);
        });

        cy.request({ method: 'POST', url: `${base}/router.php?controller=profile`, form: true, headers, body: { action: 'get_health_stats' } }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          if (body.estimated_body_fat_range) {
            expect(body.estimated_body_fat_range[0]).to.be.lessThan(body.estimated_body_fat_range[1]);
          }
          expect(['below baseline','baseline','moderately increased','highly increased','very high']).to.include(body.cvd_risk_label);
        });
      });
  });
});
