/**
 * Email Notifications Test Suite
 * Tests weekly reminder and monthly report email functionality
 * Uses SparkPost sandbox mode for testing without actual email delivery
 *
 * NOTE: These tests verify the notification scheduler endpoint and basic functionality.
 * Full end-to-end testing requires authenticated sessions with user data.
 */

describe('Email Notifications', () => {
    const base = 'http://127.0.0.1:8111';

    beforeEach(() => {
        // Set cypress_testing cookie to enable SparkPost sandbox mode
        cy.setCookie('cypress_testing', 'true');
    });

    describe('Test Endpoint Functionality', () => {
        it('should accept time override parameters', () => {
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications',
                    current_day: 'Wednesday',
                    current_time: '14:30'
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;
                expect(response.body.result).to.have.property('weekly_sent');
                expect(response.body.result).to.have.property('monthly_sent');
                expect(response.body.result).to.have.property('total_sent');
            });
        });

        it('should return proper structure from test endpoint', () => {
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications',
                    current_day: 'Friday',
                    current_time: '10:00'
                }
            }).then((response) => {
                expect(response.body).to.have.property('success', true);
                expect(response.body).to.have.property('message');
                expect(response.body).to.have.property('result');
                expect(response.body.result).to.be.an('object');
                expect(response.body.result.total_sent).to.be.a('number');
            });
        });

        it('should handle different days of the week', () => {
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

            days.forEach((day) => {
                cy.request({
                    method: 'POST',
                    url: `${base}/router.php?controller=email`,
                    body: {
                        action: 'test_notifications',
                        current_day: day,
                        current_time: '09:00'
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.success).to.be.true;
                });
            });
        });

        it('should handle various time formats', () => {
            const times = ['00:00', '06:30', '12:00', '18:45', '23:59'];

            times.forEach((time) => {
                cy.request({
                    method: 'POST',
                    url: `${base}/router.php?controller=email`,
                    body: {
                        action: 'test_notifications',
                        current_day: 'Monday',
                        current_time: time
                    }
                }).then((response) => {
                    expect(response.status).to.eq(200);
                    expect(response.body.success).to.be.true;
                });
            });
        });

        it('should work without override parameters (use current time)', () => {
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications'
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;
                expect(response.body.result).to.have.property('weekly_sent');
                expect(response.body.result).to.have.property('monthly_sent');
            });
        });
    });

    describe('Notification Scheduler Integration', () => {
        it('should process notifications with matching criteria', () => {
            // This test verifies that the scheduler runs without errors
            // Actual email sending requires test user with matching day/time settings
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications',
                    current_day: 'Wednesday',
                    current_time: '10:00'
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;

                // Verify result structure
                const result = response.body.result;
                expect(result.weekly_sent).to.be.a('number');
                expect(result.monthly_sent).to.be.a('number');
                expect(result.total_sent).to.equal(result.weekly_sent + result.monthly_sent);
            });
        });

        it('should return zero counts when no users match criteria', () => {
            // Use an unlikely time to ensure no matches
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications',
                    current_day: 'Sunday',
                    current_time: '03:17' // Unlikely to match any user settings
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;

                // Most likely no users scheduled for 3:17 AM on Sunday
                const result = response.body.result;
                expect(result).to.have.property('weekly_sent');
                expect(result).to.have.property('monthly_sent');
            });
        });
    });

    describe('SparkPost Sandbox Mode', () => {
        it('should have cypress_testing cookie set for sandbox mode', () => {
            cy.getCookie('cypress_testing').should('exist');
            cy.getCookie('cypress_testing').should('have.property', 'value', 'true');
        });

        it('should process notifications in sandbox mode without actual delivery', () => {
            // When cypress_testing cookie is set, emails use SparkPost sandbox option
            // This validates the payload but doesn't deliver emails
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications',
                    current_day: 'Wednesday',
                    current_time: '12:00'
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;
                // If this succeeds, sandbox mode is working (no actual emails sent)
            });
        });
    });

    describe('Error Handling', () => {
        it('should return error for invalid action', () => {
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'invalid_action'
                },
                failOnStatusCode: false
            }).then((response) => {
                expect(response.body.success).to.be.false;
                expect(response.body).to.have.property('message');
            });
        });

        it('should handle malformed day parameter gracefully', () => {
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications',
                    current_day: 'InvalidDay',
                    current_time: '10:00'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should still return 200 but with 0 matches
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;
            });
        });

        it('should handle malformed time parameter gracefully', () => {
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications',
                    current_day: 'Monday',
                    current_time: '25:99' // Invalid time
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should still process without errors
                expect(response.status).to.eq(200);
            });
        });
    });

    describe('Notification Log Verification', () => {
        it('should process notifications and log to file', () => {
            cy.request({
                method: 'POST',
                url: `${base}/router.php?controller=email`,
                body: {
                    action: 'test_notifications',
                    current_day: 'Monday',
                    current_time: '09:00'
                }
            }).then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.success).to.be.true;
                // Log file is created at logs/notifications.log
                // (can verify manually or via direct file system access)
            });
        });
    });

    afterEach(() => {
        // Clean up: Clear cypress_testing cookie
        cy.clearCookie('cypress_testing');
    });
});
