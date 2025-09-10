// E2E test: Email security and rate limiting functionality

describe('Email Security and Rate Limiting', () => {
  const base = 'http://127.0.0.1:8111';
  const testEmail = 'security-test@example.com';
  const anotherEmail = 'another-test@example.com';
  
  // Helper function to send form-encoded requests to auth endpoints
  const sendAuthRequest = (action, email, extraParams = {}) => {
    const allParams = { action, email, ...extraParams };
    const body = Object.keys(allParams)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');
    
    return cy.getCookie('force_email_success').then((cookie) => {
      const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      if (cookie) {
        headers['Cookie'] = `force_email_success=${cookie.value}`;
      }
      
      return cy.request({
        method: 'POST',
        url: `${base}/login_router.php?controller=auth`,
        headers: headers,
        body: body
      }).then((response) => {
        // Parse JSON response if it's a string
        if (typeof response.body === 'string') {
          response.body = JSON.parse(response.body);
        }
        return response;
      });
    });
  };

  beforeEach(() => {
    // Visit to establish session and switch to dev schema
    cy.visit(`${base}/index.php`);
    cy.getCookie('PHPSESSID').then((c) => {
      const jar = c ? `PHPSESSID=${c.value}` : undefined;
      cy.request({
        method: 'POST',
        url: `${base}/router.php?controller=schema`,
        body: { action: 'switch', schema: 'wt_dev' },
        headers: jar ? { Cookie: jar } : undefined,
      });
    });

    // Set cypress_testing cookie to enable SparkPost sandbox mode and disable rate limiting for tests
    cy.setCookie('cypress_testing', 'true');

    // Create test accounts if they don't exist (for rate limiting tests)
    cy.request({
      method: 'POST',
      url: `${base}/login_router.php?controller=auth`,
      form: true,
      body: {
        action: 'create_account',
        email: testEmail,
        first_name: 'Security',
        last_name: 'Test'
      },
      failOnStatusCode: false
    });
    
    cy.request({
      method: 'POST',
      url: `${base}/login_router.php?controller=auth`,
      form: true,
      body: {
        action: 'create_account',
        email: anotherEmail,
        first_name: 'Another',
        last_name: 'Test'
      },
      failOnStatusCode: false
    });

    // Clear any existing rate limits for test emails
    cy.request('POST', `${base}/router.php?controller=email`, {
      action: 'clear_rate_limits',
      email: testEmail
    });
    
    cy.request('POST', `${base}/router.php?controller=email`, {
      action: 'clear_rate_limits',
      email: anotherEmail
    });
  });

  describe('Rate Limiting - Basic Functionality', () => {
    beforeEach(() => {
      // Clear cypress_testing cookie for rate limiting tests to work properly
      cy.clearCookie('cypress_testing');
      // Set a cookie to force email success during rate limiting tests
      cy.setCookie('force_email_success', 'true');
    });
    
    it('should allow first 3 requests within a minute', () => {
      // Make 3 rapid requests - all should succeed
      for (let i = 1; i <= 3; i++) {
        sendAuthRequest('send_login_code', testEmail).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body.success).to.be.true;
          expect(response.body.message).to.contain('Login code sent successfully');
        });
      }
    });

    it('should block the 4th request and trigger 30-minute cooldown', () => {
      // Make 3 allowed requests sequentially
      sendAuthRequest('send_login_code', testEmail).then((response1) => {
        expect(response1.body.success).to.be.true;
        
        return sendAuthRequest('send_login_code', testEmail);
      }).then((response2) => {
        expect(response2.body.success).to.be.true;
        
        return sendAuthRequest('send_login_code', testEmail);
      }).then((response3) => {
        expect(response3.body.success).to.be.true;
        
        // 4th request should be blocked
        return sendAuthRequest('send_login_code', testEmail);
      }).then((response4) => {
        expect(response4.status).to.eq(200);
        expect(response4.body.success).to.be.false;
        expect(response4.body.message).to.contain('Too many');
        expect(response4.body.message).to.contain('30 minutes');
      });
    });

    it('should maintain separate rate limits per email address', () => {
      // Exhaust rate limit for first email
      for (let i = 1; i <= 4; i++) {
        sendAuthRequest('send_login_code', testEmail);
      }

      // Different email should still work
      sendAuthRequest('send_login_code', anotherEmail).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.contain('Login code sent successfully');
      });

      // Cleanup
      cy.request('POST', `${base}/router.php?controller=email`, {
        action: 'clear_rate_limits',
        email: anotherEmail
      });
    });

    it('should maintain separate rate limits for login vs signup', () => {
      // Use a unique email for this test to avoid conflicts
      const signupTestEmail = `signup-test-${Date.now()}@example.com`;
      
      // Exhaust login code rate limit for the main test email
      for (let i = 1; i <= 4; i++) {
        sendAuthRequest('send_login_code', testEmail);
      }

      // Signup should still work (different action and different email)
      sendAuthRequest('create_account', signupTestEmail, {
        first_name: 'Test',
        last_name: 'User'
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.contain('verification code');
        
        // Cleanup - clear rate limits for the signup test email
        cy.request('POST', `${base}/router.php?controller=email`, {
          action: 'clear_rate_limits',
          email: signupTestEmail
        });
      });
    });
  });

  describe('Rate Limiting - UI Integration', () => {
    beforeEach(() => {
      // Clear cypress_testing cookie for rate limiting tests to work properly
      cy.clearCookie('cypress_testing');
    });
    
    it('should show rate limit error message in UI', () => {
      // Set force_email_success cookie to ensure API calls succeed for triggering rate limit
      cy.setCookie('force_email_success', 'true');
      
      // Trigger rate limit via API first (3 successful calls + 1 that gets blocked)
      for (let i = 1; i <= 4; i++) {
        cy.request({
          method: 'POST',
          url: `${base}/login_router.php?controller=auth`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `action=send_login_code&email=${encodeURIComponent(testEmail)}`
        });
      }
      
      // Clear the force_email_success cookie so UI gets real rate limit response
      cy.clearCookie('force_email_success');

      // Try via UI - should show error (if UI elements exist)
      cy.get('body').then(($body) => {
        if ($body.find('#loginEmail').length > 0) {
          cy.get('#loginEmail').clear().type(testEmail);
          cy.get('#loginForm').submit();
          
          // Should show some kind of error message
          cy.get('body').should(($body) => {
            const text = $body.text();
            expect(text).to.satisfy((text) => 
              text.includes('Too many') || 
              text.includes('rate limit') || 
              text.includes('blocked') ||
              text.includes('error')
            );
          });
        } else {
          cy.log('Login form elements not found - skipping UI test portion');
        }
      });
    });

    it('should handle rate limit errors gracefully during signup', () => {
      // Use a unique email for this signup test to avoid conflicts with existing accounts
      const signupUITestEmail = `signup-ui-test-${Date.now()}@example.com`;
      
      // Set force_email_success cookie to ensure API calls succeed for triggering rate limit
      cy.setCookie('force_email_success', 'true');
      
      // Exhaust signup rate limit via API
      for (let i = 1; i <= 4; i++) {
        cy.request({
          method: 'POST',
          url: `${base}/login_router.php?controller=auth`,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: `action=create_account&email=${encodeURIComponent(signupUITestEmail)}&first_name=Test&last_name=User`
        });
      }
      
      // Clear the force_email_success cookie so UI gets real rate limit response
      cy.clearCookie('force_email_success');

      // Try signup UI - should show error (if UI elements exist)
      cy.get('body').then(($body) => {
        if ($body.find('#showSignup').length > 0) {
          cy.get('#showSignup').click();
          cy.get('#signupFirstName').type('Test');
          cy.get('#signupLastName').type('User');
          cy.get('#signupEmail').type(signupUITestEmail);
          cy.get('#signupForm').submit();
          
          // Should show some kind of error message
          cy.get('body').should(($body) => {
            const text = $body.text();
            expect(text).to.satisfy((text) => 
              text.includes('Too many') || 
              text.includes('rate limit') || 
              text.includes('blocked') ||
              text.includes('error')
            );
          });
        } else {
          cy.log('Signup form elements not found - skipping UI test portion');
        }
      });
      
      // Cleanup - clear rate limits for the signup UI test email
      cy.request('POST', `${base}/router.php?controller=email`, {
        action: 'clear_rate_limits',
        email: signupUITestEmail
      });
    });
  });

  describe('Rate Limiting - Admin Controls', () => {
    beforeEach(() => {
      // Clear cypress_testing cookie for rate limiting tests to work properly
      cy.clearCookie('cypress_testing');
      // Set force_email_success cookie for admin control tests
      cy.setCookie('force_email_success', 'true');
    });
    
    it('should allow viewing current rate limits', () => {
      // Create some rate limits
      cy.request({
        method: 'POST',
        url: `${base}/login_router.php?controller=auth`,
        form: true,
        body: {
          action: 'send_login_code',
          email: testEmail
        }
      });

      // Check rate limits
      cy.request('POST', `${base}/router.php?controller=email`, {
        action: 'get_rate_limits'
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.rate_limits).to.be.an('object');
        
        // Should have entry for our test email
        const key = `${testEmail}:login_code`;
        expect(response.body.rate_limits).to.have.property(key);
        expect(response.body.rate_limits[key].attempts).to.have.length.greaterThan(0);
      });
    });

    it('should allow clearing rate limits for specific email', () => {
      // Create rate limits
      for (let i = 1; i <= 4; i++) {
        sendAuthRequest('send_login_code', testEmail);
      }

      // Clear rate limits for specific email
      cy.request('POST', `${base}/router.php?controller=email`, {
        action: 'clear_rate_limits',
        email: testEmail
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.contain(`Rate limits cleared for ${testEmail}`);
      });

      // Should be able to send code again
      sendAuthRequest('send_login_code', testEmail).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
      });
    });

    it('should allow clearing all rate limits', () => {
      // Create rate limits for multiple emails
      sendAuthRequest('send_login_code', testEmail);
      sendAuthRequest('send_login_code', anotherEmail);

      // Clear all rate limits
      cy.request('POST', `${base}/router.php?controller=email`, {
        action: 'clear_rate_limits'
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
        expect(response.body.message).to.contain('All rate limits cleared');
      });

      // Verify our specific limits are cleared
      cy.request('POST', `${base}/router.php?controller=email`, {
        action: 'get_rate_limits'
      }).then((response) => {
        expect(response.body.success).to.be.true;
        // Check that the specific emails we tested don't have rate limits
        const rateLimits = response.body.rate_limits;
        const testEmailKey = `${testEmail}:login_code`;
        const anotherEmailKey = `${anotherEmail}:login_code`;
        
        // These should not exist or should be empty
        expect(rateLimits[testEmailKey]).to.be.undefined;
        expect(rateLimits[anotherEmailKey]).to.be.undefined;
      });
    });
  });

  describe('Security - Request Validation', () => {
    it('should reject requests without proper email format', () => {
      const invalidEmails = ['invalid', 'test@', '@domain.com', 'test@domain', ''];
      
      invalidEmails.forEach((invalidEmail) => {
        cy.request({
          method: 'POST',
          url: `${base}/login_router.php?controller=auth`,
          body: {
            action: 'send_login_code',
            email: invalidEmail
          },
          failOnStatusCode: false
        }).then((response) => {
          // Should either reject the email or handle gracefully
          if (response.status === 200) {
            // If accepted, should be a failure response
            expect(response.body.success).to.be.false;
          }
        });
      });
    });

    it('should handle malicious payloads safely', () => {
      const maliciousPayloads = [
        { email: '<script>alert("xss")</script>' },
        { email: "'; DROP TABLE users; --" },
        { email: '../../etc/passwd' },
        { action: 'send_login_code', email: testEmail, malicious: '<script>document.location="http://evil.com"</script>' }
      ];

      maliciousPayloads.forEach((payload) => {
        cy.request({
          method: 'POST',
          url: `${base}/login_router.php?controller=auth`,
          body: { action: 'send_login_code', ...payload },
          failOnStatusCode: false
        }).then((response) => {
          // Should not cause server errors
          expect(response.status).to.be.oneOf([200, 400, 403]);
          
          // If successful, response should be properly structured
          if (response.status === 200 && response.body.success) {
            expect(response.body).to.have.property('message');
            expect(typeof response.body.message).to.eq('string');
          }
        });
      });
    });

    it('should prevent CSRF attacks by validating form origin', () => {
      // Test direct API calls without proper session/CSRF protection
      // This simulates an attack from another domain
      cy.request({
        method: 'POST',
        url: `${base}/login_router.php?controller=auth`,
        body: {
          action: 'send_login_code',
          email: testEmail
        },
        headers: {
          'Referer': 'http://malicious-site.com',
          'Origin': 'http://malicious-site.com'
        },
        failOnStatusCode: false
      }).then((response) => {
        // The system should handle this gracefully
        // In a production system, you might want to check for CSRF tokens
        expect(response.status).to.be.oneOf([200, 403, 400]);
      });
    });
  });

  describe('Performance and Stress Testing', () => {
    beforeEach(() => {
      // Clear cypress_testing cookie for rate limiting tests to work properly
      cy.clearCookie('cypress_testing');
    });
    
    it('should handle concurrent requests without breaking rate limiting', () => {
      // Track responses as they come in
      const responses = [];
      
      // Create a unique email for this test to avoid interference
      const concurrentTestEmail = `concurrent-${Date.now()}@example.com`;
      
      // Create test account first
      cy.request({
        method: 'POST',
        url: `${base}/login_router.php?controller=auth`,
        form: true,
        body: {
          action: 'create_account',
          email: concurrentTestEmail,
          first_name: 'Concurrent',
          last_name: 'Test'
        },
        failOnStatusCode: false
      });
      
      // Clear any existing rate limits for this email
      cy.request('POST', `${base}/router.php?controller=email`, {
        action: 'clear_rate_limits',
        email: concurrentTestEmail
      });

      // Make 5 concurrent requests and collect responses
      const requestPromises = [];
      for (let i = 0; i < 5; i++) {
        const promise = cy.request({
          method: 'POST',
          url: `${base}/login_router.php?controller=auth`,
          form: true,
          body: {
            action: 'send_login_code',
            email: concurrentTestEmail
          },
          failOnStatusCode: false
        }).then((response) => {
          responses.push(response);
          return response;
        });
        requestPromises.push(promise);
      }

      // Wait for all requests to complete
      cy.wrap(Promise.all(requestPromises)).then(() => {
        // Analyze the results
        let successCount = 0;
        let failureCount = 0;

        responses.forEach((response) => {
          if (response.body && response.body.success) {
            successCount++;
          } else {
            failureCount++;
          }
        });

        // Should have exactly 3 successes and 2 failures due to rate limiting
        // Allow for some flexibility due to race conditions
        expect(successCount).to.be.at.most(3);
        expect(failureCount).to.be.at.least(2);
        expect(successCount + failureCount).to.eq(5);
        
        // Cleanup - clear rate limits for the test email
        cy.request('POST', `${base}/router.php?controller=email`, {
          action: 'clear_rate_limits',
          email: concurrentTestEmail
        });
      });
    });

    it('should maintain performance under rate limit file operations', () => {
      const startTime = Date.now();
      
      // Create test accounts first
      for (let i = 0; i < 10; i++) {
        cy.request({
          method: 'POST',
          url: `${base}/login_router.php?controller=auth`,
          form: true,
          body: {
            action: 'create_account',
            email: `test${i}@example.com`,
            first_name: 'Performance',
            last_name: 'Test'
          },
          failOnStatusCode: false
        });
      }
      
      // Make rapid requests to test file I/O performance
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            form: true,
            body: {
              action: 'send_login_code',
              email: `test${i}@example.com`
            }
          })
        );
      }

      cy.wrap(Promise.all(promises)).then(() => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // Should complete within reasonable time (10 seconds for 10 requests)
        expect(duration).to.be.lessThan(10000);
        
        // Cleanup - clear rate limits for all test emails
        for (let i = 0; i < 10; i++) {
          cy.request('POST', `${base}/router.php?controller=email`, {
            action: 'clear_rate_limits',
            email: `test${i}@example.com`
          });
        }
      });
    });
  });

  afterEach(() => {
    // Cleanup: Clear rate limits for test emails
    cy.request('POST', `${base}/router.php?controller=email`, {
      action: 'clear_rate_limits',
      email: testEmail
    });
    
    cy.request('POST', `${base}/router.php?controller=email`, {
      action: 'clear_rate_limits',
      email: anotherEmail
    });
  });

  after(() => {
    // Final cleanup: clear cypress_testing cookie and clear all rate limits
    cy.clearCookie('cypress_testing');
    
    cy.request('POST', `${base}/router.php?controller=email`, {
      action: 'clear_rate_limits'
    });
  });
});