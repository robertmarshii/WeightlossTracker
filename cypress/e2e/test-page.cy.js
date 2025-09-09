describe('Test page DB output', () => {
  it('retrieves DB JSON via API while visiting test page', () => {
    // Keep visit to ensure server and routing are working
    cy.visit('/test/test.php');
    // Query the API directly for deterministic JSON shape
    cy.request('POST', '/router.php?controller=get1', { page: 1 }).then((resp) => {
      const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
      expect(body).to.be.an('array').and.to.have.length.greaterThan(0);
      const first = body[0];
      expect(first).to.have.all.keys('id', 'val');
    });
  });
});
