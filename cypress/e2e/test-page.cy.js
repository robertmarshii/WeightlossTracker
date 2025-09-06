describe('Test page DB output', () => {
  it('renders JSON from database on /test/test.php', () => {
    cy.visit('/test/test.php');
    // Ensure script ran and content was appended
    cy.get('body', { timeout: 10000 }).should('contain.text', 'new_tablecol');
    cy.get('body').invoke('text').then((text) => {
      const trimmed = text.trim();
      expect(() => JSON.parse(trimmed)).not.to.throw();
      const data = JSON.parse(trimmed);
      expect(data).to.be.an('array').and.to.have.length.greaterThan(0);
      // Validate expected seed data when present
      const ids = data.map((r) => r.idnew_table);
      expect(ids).to.include.members([1, 2, 3]);
      const first = data.find((r) => r.idnew_table === 1);
      expect(first).to.have.property('new_tablecol');
    });
  });
});

