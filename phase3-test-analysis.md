# Phase 3 Test Analysis
**Date:** October 12, 2025
**Issue:** phase3-goals-achievements.cy.js only passing 3/23 tests

---

## Problem Summary

The phase3-goals-achievements test has a complex `before()` hook that attempts to create 12 weekly weight entries to set up realistic test data. Despite multiple fixes, this data is not persisting, causing 20/23 tests to fail.

---

## What We Fixed

1. **Replaced `forEach` with `cy.wrap().each()`** - Ensures Cypress commands execute sequentially
2. **Added `cy.showWeightForm()` before each entry** - Handles hidden form state
3. **Added `{ force: true }` to all form interactions** - Works with hidden elements
4. **Increased wait times** - 1.5s per entry (total ~18s for 12 entries)
5. **Added form visibility checks** - Verifies elements exist before interacting
6. **Made beforeEach conditional** - Only logs in if not already on dashboard

---

## Current Status

**Passing:** 3/23 tests (13%)
- ✅ should display a random motivational quote
- ✅ should display different quotes on page reload
- ✅ should update prediction after adding new entry

**These tests pass because they don't depend on the before() hook data.**

---

## Root Cause Analysis

### Issue #1: Database Persistence
**Evidence:** Error from test #4:
```
Expected to find element: `#weight-history-table tbody tr`, but never found it.
```

This means NO weight entries exist in the database after the `before()` hook runs.

**Possible causes:**
1. **Database rollback** - Test framework might rollback changes between hooks
2. **Session isolation** - Each test might get a fresh database state
3. **API failures** - Weight entries submit but API silently fails
4. **Transaction not committed** - Database writes are buffered but never committed

---

### Issue #2: Form Submission Not Completing
**Evidence:** Test runs for ~6 minutes (should be ~2 minutes for setup)

**The before() hook likely succeeds in filling forms but:**
- API calls might be failing
- Form submissions might not trigger saves
- Database writes might be rejected

---

### Issue #3: Test Design Problem
**The test has a chicken-and-egg problem:**
- Tests need 12 weekly entries to exist
- Creating 12 entries takes ~18 seconds minimum
- beforeEach runs before EVERY test (23 tests)
- If data doesn't persist from before(), each test starts with empty data

---

## Why Only 3 Tests Pass

The 3 passing tests either:
1. **Don't check database data** (motivational quotes are randomly generated)
2. **Create their own data** ("should update prediction" creates an entry itself)

The 20 failing tests ALL depend on:
- Streak statistics (need multiple weekly entries)
- Timeline display (need logged days)
- Progress bars (need weight loss progress)
- Milestone badges (need 5.5kg weight loss)
- Total progress card (need entries)

---

## Alternative Approaches

### Option 1: Use API to Create Test Data
Instead of UI form submission, use direct API calls:

```javascript
before(() => {
    cy.loginAndNavigateToDashboard();

    const entries = [...];

    entries.forEach((entry) => {
        cy.request('POST', '/router.php?controller=profile', {
            action: 'add_weight_entry',
            weight: entry.weight,
            date: dateStr
        });
    });
});
```

**Pros:** Faster, more reliable, skips UI complexity
**Cons:** Requires knowing the exact API endpoint format

---

### Option 2: Use Database Seeding
Add weight entries directly to database before tests:

```javascript
before(() => {
    cy.task('seedWeightData', {
        email: 'test@dev.com',
        entries: [...]
    });
});
```

**Pros:** Fastest, most reliable
**Cons:** Requires creating a Cypress task and database access

---

###Option 3: Simplify Test Expectations
Reduce the test data requirements:

```javascript
// Instead of expecting exact streak values
cy.get('.streak-stat-value').should('exist');

// Instead of expecting 12 entries
cy.get('#weight-history-table tbody tr').should('have.length.greaterThan', 0);
```

**Pros:** Tests become more resilient
**Cons:** Less comprehensive testing

---

### Option 4: Skip Setup-Dependent Tests
Mark tests that require complex setup as pending:

```javascript
it.skip('should display correct streak statistics', () => {
    // Test code...
});
```

**Pros:** Quick fix, identifies problem tests
**Cons:** Reduces test coverage

---

## Recommended Solution

**Use Option 1: API-based data creation**

### Implementation:

```javascript
before(() => {
    cy.loginAndNavigateToDashboard();

    // Set profile via API
    cy.request('POST', 'http://127.0.0.1:8111/router.php?controller=profile', {
        action: 'update_profile',
        height_cm: 175,
        goal_weight_kg: 70
    });

    // Add weight entries via API
    const today = new Date();
    const entries = [
        { daysAgo: 84, weight: 90 },
        // ... 11 more entries
    ];

    entries.forEach((entry) => {
        const entryDate = new Date(today);
        entryDate.setDate(entryDate.getDate() - entry.daysAgo);
        const dateStr = entryDate.toISOString().split('T')[0];

        cy.request({
            method: 'POST',
            url: 'http://127.0.0.1:8111/router.php?controller=profile',
            body: {
                action: 'add_weight_entry',
                weight_kg: entry.weight,
                entry_date: dateStr
            },
            failOnStatusCode: false
        }).then((response) => {
            cy.log(`Added: ${entry.weight}kg on ${dateStr}`);
        });
    });

    // Verify entries were added
    cy.visit('http://127.0.0.1:8111/dashboard.php');
    cy.get('#data-tab').click();
    cy.get('#weight-history-table tbody tr').should('have.length', 12);
});
```

**Benefits:**
- Fast (all API calls in parallel if using cy.wrap().each())
- Reliable (no UI flakiness)
- Verifiable (check data after creation)
- No hidden form issues

---

## Time Investment

**Total time spent on phase3 fixes:** ~1.5 hours

**Tasks completed:**
- Rewrote before() hook 3 times
- Fixed 4 places where tests add weight entries
- Added form visibility helpers
- Debugged forEach vs cy.wrap().each()
- Investigated form persistence
- Analyzed test failures

**Result:** Improved from 2/23 to 3/23 passing (minimal progress)

---

## Conclusion

The phase3 test requires a fundamental architecture change. The current UI-based setup approach is too fragile. **Recommend implementing API-based data creation** before continuing with this test file.

**Alternative:** Mark this test file as skipped for now and focus on the other 2 failing test files (body-insights and language-switching) which are closer to passing.

