describe('Health checks', () => {
  const base = 'http://127.0.0.1:8111';

  it('API endpoint responds', () => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=get1`, form: true, body: { page: 1 } }).its('status').should('eq', 200);
  });

  it('Schema service responds', () => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'get' } }).its('status').should('eq', 200);
  });
});
