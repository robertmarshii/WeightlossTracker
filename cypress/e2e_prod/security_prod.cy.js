// Production security checks for public access to test pages

describe('Production test-page access controls', () => {
  const prod = 'https://www.weightloss-tracker.com';

  it('index is reachable (basic sanity)', () => {
    cy.request({ method: 'GET', url: `${prod}/`, followRedirect: true }).its('status').should('be.within', 200, 399);
  });

  it('denies /test/test-interface.html', () => {
    cy.request({
      method: 'GET',
      url: `${prod}/test/test-interface.html`,
      failOnStatusCode: false,
      followRedirect: true,
    }).then((resp) => {
      expect([403, 404]).to.include(resp.status);
    });
  });

  it('denies /test/schema-switcher.html', () => {
    cy.request({
      method: 'GET',
      url: `${prod}/test/schema-switcher.html`,
      failOnStatusCode: false,
      followRedirect: true,
    }).then((resp) => {
      expect([403, 404]).to.include(resp.status);
    });
  });

  it('denies router.php without login (GET)', () => {
    cy.request({
      method: 'GET',
      url: `${prod}/router.php`,
      failOnStatusCode: false,
      followRedirect: true,
    }).then((resp) => {
      expect([401, 403, 404]).to.include(resp.status);
    });
  });

  it('denies router.php without login (POST controller=get1)', () => {
    cy.request({
      method: 'POST',
      url: `${prod}/router.php?controller=get1`,
      form: true,
      body: { page: 1 },
      failOnStatusCode: false,
      followRedirect: true,
    }).then((resp) => {
      expect([401, 403, 404]).to.include(resp.status);
    });
  });

  it('allows public access to login_router.php (GET)', () => {
    cy.request({
      method: 'GET',
      url: `${prod}/login_router.php?controller=auth`,
      failOnStatusCode: false,
      followRedirect: true,
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 399);
      // Expect JSON error shape when no action is provided
      const body = typeof resp.body === 'string' ? (() => { try { return JSON.parse(resp.body); } catch { return null; } })() : resp.body;
      if (body) {
        expect(body.success).to.eq(false);
        expect(String(body.message || '')).to.have.length.greaterThan(0);
      }
    });
  });

  it('allows public access to login_router.php (POST no-op)', () => {
    cy.request({
      method: 'POST',
      url: `${prod}/login_router.php?controller=auth`,
      form: true,
      body: {},
      failOnStatusCode: false,
      followRedirect: true,
    }).then((resp) => {
      expect(resp.status).to.be.within(200, 399);
      const body = typeof resp.body === 'string' ? (() => { try { return JSON.parse(resp.body); } catch { return null; } })() : resp.body;
      if (body) {
        expect(body.success).to.eq(false);
        expect(String(body.message || '')).to.have.length.greaterThan(0);
      }
    });
  });
});
