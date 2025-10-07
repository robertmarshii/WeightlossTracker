/**
 * Phase 3: Goals & Achievements - Comprehensive Testing
 *
 * Tests all three new achievement areas added in Phase 3:
 * 1. Consistency Score - Weekly streak tracking with visual timeline
 * 2. Encouragement - Random motivational quotes with translations
 * 3. Next Check-In - Predictive weigh-in date based on user patterns
 *
 * Coverage includes:
 * - Translation system (EN/ES/FR/DE) for all dynamic content
 * - Weight unit conversions (kg/lbs/st) for milestone badges
 * - Data persistence across page reloads
 * - Real-time updates when entries are added/removed
 * - Percentage calculations for progress bars
 * - Streak counter timeline accuracy (28-day window)
 * - Milestone badge visibility based on progress
 * - Next check-in date predictions
 */

describe('Phase 3: Goals & Achievements Tab - Complete Coverage', () => {
    const testUser = {
        email: `phase3test_${Date.now()}@test.com`,
        profile: {
            height: 175, // cm
            goalWeight: 70, // kg
            goalDate: '2025-12-31'
        }
    };

    before(() => {
        cy.log('🧪 Phase 3 Test Setup - Creating test user with weight data');

        // Register and login
        cy.visit('/');
        cy.get('#signupEmail').type(testUser.email);
        cy.get('#signupCode').type('letmein123');
        cy.get('#agreeTerms').check();
        cy.get('#verifySignupForm').submit();
        cy.url().should('include', 'dashboard.php');

        // Set user profile
        cy.get('.nav-link').contains('Settings').click();
        cy.get('#heightCm').clear().type(testUser.profile.height);
        cy.get('#weightUnit').select('kg');
        cy.get('#language').select('en');
        cy.get('#saveSettingsBtn').click();
        cy.get('#settings-status').should('contain', 'saved successfully');

        // Navigate to Goals tab to set goal
        cy.get('.nav-link').contains('Goals').click();
        cy.get('#goalWeight').clear().type(testUser.profile.goalWeight);
        cy.get('#goalDate').type(testUser.profile.goalDate);
        cy.get('#btn-save-goal').click();
        cy.wait(500);

        // Add weight entries to create realistic data
        // Entry pattern: Weekly entries with gradual weight loss
        const today = new Date();
        const entries = [
            { daysAgo: 84, weight: 90 },  // Week 1 (12 weeks ago)
            { daysAgo: 77, weight: 89.5 }, // Week 2
            { daysAgo: 70, weight: 89 },   // Week 3
            { daysAgo: 63, weight: 88.5 }, // Week 4
            { daysAgo: 56, weight: 88 },   // Week 5
            { daysAgo: 49, weight: 87.5 }, // Week 6
            { daysAgo: 42, weight: 87 },   // Week 7
            { daysAgo: 35, weight: 86.5 }, // Week 8
            { daysAgo: 28, weight: 86 },   // Week 9 (4 weeks ago - streak window starts)
            { daysAgo: 21, weight: 85.5 }, // Week 10
            { daysAgo: 14, weight: 85 },   // Week 11
            // Week 12 - MISSED (no entry)
            { daysAgo: 0, weight: 84.5 }   // Today (Week 13)
        ];

        cy.get('.nav-link').contains('Overview').click();

        entries.forEach((entry, index) => {
            const entryDate = new Date(today);
            entryDate.setDate(entryDate.getDate() - entry.daysAgo);
            const dateStr = entryDate.toISOString().split('T')[0];

            cy.log(`Adding entry ${index + 1}/${entries.length}: ${entry.weight}kg on ${dateStr}`);
            cy.get('#newWeight').clear().type(entry.weight);
            cy.get('#newDate').type(dateStr);
            cy.get('#btn-add-weight').click();
            cy.wait(300);
        });

        cy.log('✅ Test setup complete - User has 12 weekly entries with 1 missed week');
    });

    beforeEach(() => {
        // Login before each test
        cy.visit('/');
        cy.get('#loginEmail').type(testUser.email);
        cy.get('#sendLoginCodeBtn').click();
        cy.wait(500);
        cy.get('#loginCode').type('letmein123');
        cy.get('#verifyLoginForm').submit();
        cy.url().should('include', 'dashboard.php');

        // Navigate to Goals tab
        cy.get('.nav-link').contains('Goals').click();
        cy.wait(500);
    });

    describe('1. Consistency Score - Streak Counter', () => {
        it('should display correct streak statistics', () => {
            cy.log('📊 Testing streak counter statistics display');

            // Check that streak counter is visible
            cy.get('#streak-counter').should('be.visible');

            // Verify current streak (should be 2 consecutive weeks: week 11 and today)
            cy.get('.streak-stat-row').first().within(() => {
                cy.get('.streak-stat-icon').should('contain', '🔥');
                cy.get('.streak-stat-value').should('contain', '2');
                cy.get('.streak-stat-label').should('contain', 'Current Streak');
            });

            // Verify personal best (longest streak from weeks 1-11)
            cy.get('.streak-stat-row').eq(1).within(() => {
                cy.get('.streak-stat-icon').should('contain', '🏆');
                cy.get('.streak-stat-value').should('contain', '11');
                cy.get('.streak-stat-label').should('contain', 'Personal Best');
            });

            // Verify missed entries (1 missed week in last 28 days)
            cy.get('.streak-stat-row').eq(2).within(() => {
                cy.get('.streak-stat-icon').should('contain', '📊');
                cy.get('.streak-stat-value').should('contain', '1');
                cy.get('.streak-stat-label').should('contain', 'Missed Entries');
            });
        });

        it('should display 28-day timeline with correct logged days', () => {
            cy.log('📅 Testing 28-day streak timeline');

            // Check timeline title
            cy.get('.streak-timeline-title').should('contain', 'Last 28 Days');

            // Verify timeline grid has 28 dots
            cy.get('.streak-timeline-grid .streak-dot').should('have.length', 28);

            // Check that timeline shows 7 dots per row (weekly calendar)
            cy.get('.streak-timeline-grid').should('have.css', 'grid-template-columns')
                .and('match', /repeat\(7/);

            // Verify logged days (weeks 9, 10, 11, 13 within 28-day window)
            cy.get('.streak-dot.logged').should('have.length', 4);

            // Verify missed days (all other days in 28-day window)
            cy.get('.streak-dot.missed').should('have.length', 24);

            // Check legend shows "Logged" label
            cy.get('.streak-legend-label').should('contain', 'Logged');
        });

        it('should update streak when new entry is added', () => {
            cy.log('➕ Testing streak update after adding new entry');

            // Record current streak
            cy.get('.streak-stat-row').first().find('.streak-stat-value')
                .invoke('text').then((currentStreak) => {
                    const currentValue = parseInt(currentStreak);

                    // Add entry for 7 days ago (extends streak to 3 weeks)
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

                    cy.get('.nav-link').contains('Overview').click();
                    cy.get('#newWeight').clear().type('84.8');
                    cy.get('#newDate').type(dateStr);
                    cy.get('#btn-add-weight').click();
                    cy.wait(500);

                    // Navigate back to Goals
                    cy.get('.nav-link').contains('Goals').click();
                    cy.wait(500);

                    // Verify streak increased by 1
                    cy.get('.streak-stat-row').first().find('.streak-stat-value')
                        .should('contain', currentValue + 1);

                    // Verify logged dots increased by 1
                    cy.get('.streak-dot.logged').should('have.length', 5);
                });
        });

        it('should update timeline when entry is removed', () => {
            cy.log('➖ Testing timeline update after removing entry');

            // Navigate to Data tab to delete an entry
            cy.get('.nav-link').contains('Data').click();
            cy.wait(500);

            // Delete the most recent entry
            cy.get('#weight-history-table tbody tr').first()
                .find('.danger-btn').click();
            cy.wait(500);

            // Navigate back to Goals
            cy.get('.nav-link').contains('Goals').click();
            cy.wait(500);

            // Verify current streak dropped to 1 (only week 11 remains)
            cy.get('.streak-stat-row').first().find('.streak-stat-value')
                .should('contain', '1');

            // Verify logged dots decreased by 1
            cy.get('.streak-dot.logged').should('have.length', 3);
        });
    });

    describe('2. Encouragement - Motivational Quotes', () => {
        it('should display a random motivational quote', () => {
            cy.log('💬 Testing encouragement quote display');

            // Verify quote container exists and is visible
            cy.get('#encouragement-card').should('be.visible');
            cy.get('.encouragement-quote').should('be.visible');

            // Verify quote is not empty and has quotation marks
            cy.get('.encouragement-quote').invoke('text').then((quoteText) => {
                expect(quoteText).to.not.be.empty;
                expect(quoteText).to.include('"');
            });
        });

        it('should display different quotes on page reload', () => {
            cy.log('🔄 Testing quote randomization');

            // Get first quote
            cy.get('.encouragement-quote').invoke('text').then((firstQuote) => {
                const quotes = [];
                quotes.push(firstQuote);

                // Reload page multiple times to get different quotes
                for (let i = 0; i < 5; i++) {
                    cy.reload();
                    cy.get('.nav-link').contains('Goals').click();
                    cy.wait(300);
                    cy.get('.encouragement-quote').invoke('text').then((quote) => {
                        if (!quotes.includes(quote)) {
                            quotes.push(quote);
                        }
                    });
                }

                // After 5 reloads, we should have seen at least 2 different quotes
                cy.wrap(quotes).should('have.length.greaterThan', 1);
            });
        });
    });

    describe('3. Next Check-In - Predictive Date', () => {
        it('should display predicted next weigh-in date', () => {
            cy.log('📆 Testing next check-in prediction');

            // Verify next check-in container is visible
            cy.get('#next-checkin').should('be.visible');

            // Should show a date prediction (user has consistent weekly pattern)
            cy.get('#next-checkin').should('not.contain', 'Log more weights');

            // Should show "days from now" text
            cy.get('#next-checkin').invoke('text').then((text) => {
                expect(text).to.match(/\d+ days from now/);
            });
        });

        it('should update prediction after adding new entry', () => {
            cy.log('🔮 Testing prediction update after new entry');

            // Add entry for yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const dateStr = yesterday.toISOString().split('T')[0];

            cy.get('.nav-link').contains('Overview').click();
            cy.get('#newWeight').clear().type('84.3');
            cy.get('#newDate').type(dateStr);
            cy.get('#btn-add-weight').click();
            cy.wait(500);

            // Navigate back to Goals
            cy.get('.nav-link').contains('Goals').click();
            cy.wait(500);

            // Prediction should now be approximately 6-7 days (weekly pattern)
            cy.get('#next-checkin').invoke('text').then((text) => {
                const match = text.match(/(\d+) days from now/);
                if (match) {
                    const days = parseInt(match[1]);
                    expect(days).to.be.within(5, 8); // Allow some variance
                }
            });
        });
    });

    describe('4. Translation System - All Languages', () => {
        const languages = [
            { code: 'es', name: 'Spanish', streakLabel: 'Racha Actual' },
            { code: 'fr', name: 'French', streakLabel: 'Série Actuelle' },
            { code: 'de', name: 'German', streakLabel: 'Aktuelle Serie' },
            { code: 'en', name: 'English', streakLabel: 'Current Streak' }
        ];

        languages.forEach((lang) => {
            it(`should display all achievement content in ${lang.name}`, () => {
                cy.log(`🌐 Testing ${lang.name} translation for all achievement areas`);

                // Change language in settings
                cy.get('.nav-link').contains('Settings').click();
                cy.get('#language').select(lang.code);
                cy.get('#saveSettingsBtn').click();
                cy.get('#settings-status').should('contain', lang.code === 'en' ? 'saved successfully' : '');
                cy.wait(500);

                // Navigate back to Goals
                cy.get('.nav-link').contains('Goals').click();
                cy.wait(500);

                // Verify streak counter labels are translated
                cy.get('.streak-stat-row').first()
                    .find('.streak-stat-label')
                    .should('contain', lang.streakLabel);

                // Verify timeline title is translated
                if (lang.code === 'es') {
                    cy.get('.streak-timeline-title').should('contain', 'Últimos 28 Días');
                } else if (lang.code === 'fr') {
                    cy.get('.streak-timeline-title').should('contain', '28 Derniers Jours');
                } else if (lang.code === 'de') {
                    cy.get('.streak-timeline-title').should('contain', 'Letzte 28 Tage');
                } else {
                    cy.get('.streak-timeline-title').should('contain', 'Last 28 Days');
                }

                // Verify encouragement quote has translation attribute
                cy.get('.encouragement-quote').should('have.attr', `data-${
                    lang.code === 'en' ? 'eng' :
                    lang.code === 'es' ? 'spa' :
                    lang.code === 'fr' ? 'fre' : 'ger'
                }`);

                // Verify data is still visible (not wiped by translation)
                cy.get('.streak-stat-value').should('be.visible');
                cy.get('.streak-timeline-grid .streak-dot').should('exist');
            });
        });

        it('should persist language selection after page reload', () => {
            cy.log('💾 Testing language persistence across page reloads');

            // Set language to Spanish
            cy.get('.nav-link').contains('Settings').click();
            cy.get('#language').select('es');
            cy.get('#saveSettingsBtn').click();
            cy.wait(500);

            // Reload page
            cy.reload();
            cy.wait(500);

            // Navigate to Goals
            cy.get('.nav-link').contains('Goals').click();
            cy.wait(500);

            // Verify Spanish is still active
            cy.get('.streak-stat-row').first()
                .find('.streak-stat-label')
                .should('contain', 'Racha Actual');

            // Reset to English
            cy.get('.nav-link').contains('Settings').click();
            cy.get('#language').select('en');
            cy.get('#saveSettingsBtn').click();
        });
    });

    describe('5. Weight Unit Conversions - Milestone Badges', () => {
        it('should display milestone badges in kg', () => {
            cy.log('⚖️ Testing milestone badges in kg');

            // Ensure weight unit is kg
            cy.get('.nav-link').contains('Settings').click();
            cy.get('#weightUnit').select('kg');
            cy.get('#saveSettingsBtn').click();
            cy.wait(500);

            cy.get('.nav-link').contains('Goals').click();
            cy.wait(500);

            // User has lost 5.5kg (90 - 84.5), should see 1kg, 3kg, 5kg badges unlocked
            cy.get('.goal-badge').filter('.unlocked').should('have.length.at.least', 3);

            // Verify badge labels are in kg
            cy.get('.goal-badge.unlocked').first().should('contain', 'kg');
        });

        it('should convert milestone badges to lbs', () => {
            cy.log('🔄 Testing milestone badge conversion to lbs');

            // Change to lbs
            cy.get('.nav-link').contains('Settings').click();
            cy.get('#weightUnit').select('lbs');
            cy.get('#saveSettingsBtn').click();
            cy.wait(500);

            cy.get('.nav-link').contains('Goals').click();
            cy.wait(500);

            // Badges should now show lbs values (1kg ≈ 2.2lbs, 3kg ≈ 6.6lbs, 5kg ≈ 11lbs)
            cy.get('.goal-badge.unlocked').first().should('contain', 'lbs');

            // Verify data is still visible after unit change
            cy.get('.streak-stat-value').should('be.visible');
            cy.get('#total-progress').should('not.contain', 'Loading');
        });

        it('should convert milestone badges to stone', () => {
            cy.log('🪨 Testing milestone badge conversion to stone');

            // Change to stone
            cy.get('.nav-link').contains('Settings').click();
            cy.get('#weightUnit').select('st');
            cy.get('#saveSettingsBtn').click();
            cy.wait(500);

            cy.get('.nav-link').contains('Goals').click();
            cy.wait(500);

            // Badges should now show stone values
            cy.get('.goal-badge').should('contain', 'st');

            // Reset to kg
            cy.get('.nav-link').contains('Settings').click();
            cy.get('#weightUnit').select('kg');
            cy.get('#saveSettingsBtn').click();
        });
    });

    describe('6. Progress Bars & Percentages', () => {
        it('should calculate ideal weight progress percentage correctly', () => {
            cy.log('📊 Testing ideal weight progress bar calculation');

            // Get progress bar percentage
            cy.get('.goal-progress-item').first().within(() => {
                cy.get('.goal-progress-bar-fill').invoke('attr', 'style').then((style) => {
                    const match = style.match(/width:\s*(\d+\.?\d*)%/);
                    if (match) {
                        const percentage = parseFloat(match[1]);
                        // User lost 5.5kg out of 20kg goal (90 - 70)
                        // Expected: (5.5 / 20) * 100 = 27.5%
                        expect(percentage).to.be.closeTo(27.5, 2);
                    }
                });

                // Verify percentage text is displayed
                cy.get('.goal-progress-percentage').should('be.visible');
            });
        });

        it('should update progress bar when new entry is added', () => {
            cy.log('📈 Testing progress bar update after weight loss');

            // Get current percentage
            cy.get('.goal-progress-bar-fill').first().invoke('attr', 'style').then((currentStyle) => {
                const currentMatch = currentStyle.match(/width:\s*(\d+\.?\d*)%/);
                const currentPercentage = currentMatch ? parseFloat(currentMatch[1]) : 0;

                // Add entry with more weight loss
                cy.get('.nav-link').contains('Overview').click();
                const today = new Date().toISOString().split('T')[0];
                cy.get('#newWeight').clear().type('83'); // 1.5kg more loss
                cy.get('#newDate').type(today);
                cy.get('#btn-add-weight').click();
                cy.wait(500);

                cy.get('.nav-link').contains('Goals').click();
                cy.wait(500);

                // Verify percentage increased
                cy.get('.goal-progress-bar-fill').first().invoke('attr', 'style').then((newStyle) => {
                    const newMatch = newStyle.match(/width:\s*(\d+\.?\d*)%/);
                    const newPercentage = newMatch ? parseFloat(newMatch[1]) : 0;
                    expect(newPercentage).to.be.greaterThan(currentPercentage);
                });
            });
        });
    });

    describe('7. Milestone Badges - Dynamic Visibility', () => {
        it('should unlock new milestone badge when threshold is reached', () => {
            cy.log('🏆 Testing milestone badge unlock');

            // Count currently unlocked badges (5.5kg lost)
            cy.get('.goal-badge.unlocked').its('length').then((initialCount) => {
                // Add entries to lose 2kg more (total 7.5kg lost)
                cy.get('.nav-link').contains('Overview').click();

                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const dateStr = tomorrow.toISOString().split('T')[0];

                cy.get('#newWeight').clear().type('82.5');
                cy.get('#newDate').type(dateStr);
                cy.get('#btn-add-weight').click();
                cy.wait(500);

                cy.get('.nav-link').contains('Goals').click();
                cy.wait(500);

                // Should now have 7kg badge unlocked
                cy.get('.goal-badge.unlocked').should('have.length.greaterThan', initialCount);
            });
        });

        it('should lock milestone badge when progress is reduced', () => {
            cy.log('🔒 Testing milestone badge lock after entry deletion');

            // Count unlocked badges
            cy.get('.goal-badge.unlocked').its('length').then((initialCount) => {
                // Delete recent entries to reduce progress
                cy.get('.nav-link').contains('Data').click();
                cy.wait(500);

                // Delete top 3 entries
                for (let i = 0; i < 3; i++) {
                    cy.get('#weight-history-table tbody tr').first()
                        .find('.danger-btn').click();
                    cy.wait(300);
                }

                cy.get('.nav-link').contains('Goals').click();
                cy.wait(500);

                // Should have fewer unlocked badges
                cy.get('.goal-badge.unlocked').should('have.length.lessThan', initialCount);
            });
        });
    });

    describe('8. Data Persistence & Reload', () => {
        it('should maintain all achievement data after page reload', () => {
            cy.log('💾 Testing data persistence across page reload');

            // Record current state
            let initialData = {};

            cy.get('.streak-stat-row').first().find('.streak-stat-value')
                .invoke('text').then((streak) => {
                    initialData.currentStreak = streak;
                });

            cy.get('.streak-stat-row').eq(1).find('.streak-stat-value')
                .invoke('text').then((best) => {
                    initialData.personalBest = best;
                });

            cy.get('.streak-dot.logged').its('length').then((count) => {
                initialData.loggedDays = count;
            });

            cy.get('.encouragement-quote').invoke('text').then((quote) => {
                initialData.quote = quote;
            });

            // Reload page
            cy.reload();
            cy.wait(500);
            cy.get('.nav-link').contains('Goals').click();
            cy.wait(500);

            // Verify data matches (except quote which is random)
            cy.get('.streak-stat-row').first().find('.streak-stat-value')
                .should('contain', initialData.currentStreak);

            cy.get('.streak-stat-row').eq(1).find('.streak-stat-value')
                .should('contain', initialData.personalBest);

            cy.get('.streak-dot.logged').should('have.length', initialData.loggedDays);

            // Quote should be visible but may be different
            cy.get('.encouragement-quote').should('be.visible');
        });
    });

    describe('9. Total Progress Card', () => {
        it('should display total weight loss correctly', () => {
            cy.log('📊 Testing total progress card');

            cy.get('#total-progress').should('be.visible');
            cy.get('#total-progress').should('contain', 'kg lost');

            // Should show "Over X entries" text
            cy.get('#total-progress').invoke('text').then((text) => {
                expect(text).to.match(/Over \d+ entries/);
            });
        });

        it('should persist after chart view changes', () => {
            cy.log('📉 Testing total progress persistence across chart changes');

            // Navigate to Charts tab
            cy.get('.nav-link').contains('Charts').click();
            cy.wait(500);

            // Change chart view to weekly
            cy.get('#view-weekly').click();
            cy.wait(500);

            // Navigate back to Goals
            cy.get('.nav-link').contains('Goals').click();
            cy.wait(500);

            // Total progress should still show overall data (not week-specific)
            cy.get('#total-progress').should('contain', 'kg lost');
            cy.get('#total-progress').invoke('text').then((text) => {
                expect(text).to.match(/Over \d+ entries/);
                // Should show total entries (12+), not just weekly count
                const match = text.match(/Over (\d+) entries/);
                if (match) {
                    expect(parseInt(match[1])).to.be.at.least(10);
                }
            });
        });
    });

    after(() => {
        cy.log('🧹 Phase 3 Test Cleanup - Test user will be cleaned up by database reset');
    });
});
