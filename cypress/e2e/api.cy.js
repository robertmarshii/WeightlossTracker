describe('API basic', () => {
  const base = 'http://127.0.0.1:8111';
  before(() => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=seeder`, form: true, body: { action: 'reset_schema', schema: 'wt_test' } });
    cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'switch', schema: 'wt_test' } });
  });

  it('returns data from get1', () => {
    cy.request({ method: 'POST', url: `${base}/router.php?controller=get1`, form: true, body: { page: 1 } }).then((resp) => {
      expect(resp.status).to.eq(200);
      const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
      expect(data).to.be.an('array');
      expect(data.length).to.be.greaterThan(0);
      expect(data[0]).to.have.keys(['id', 'val']);
    });
  });
});
