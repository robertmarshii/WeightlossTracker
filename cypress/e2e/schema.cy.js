describe('Schema service', () => {
  const base = 'http://127.0.0.1:8111';
  const schemas = ['wt_test', 'wt_dev'];

  it('switches schemas', () => {
    schemas.forEach((schema) => {
      cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'switch', schema } }).its('status').should('eq', 200);
      cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'get' } }).its('status').should('eq', 200);
    });
  });
});
