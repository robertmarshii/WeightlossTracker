// Custom Cypress Commands for Weight Loss Tracker

/**
 * Shows the weight entry form if it's hidden
 * Usage: cy.showWeightForm()
 */
Cypress.Commands.add('showWeightForm', () => {
    cy.get('body').then(($body) => {
        if ($body.find('#add-entry-form.hidden').length > 0) {
            cy.log('Weight form is hidden, showing it');
            cy.get('#add-entry-form').invoke('removeClass', 'hidden');
            cy.wait(300);
        } else if ($body.find('#add-entry-form').length > 0 && !$body.find('#add-entry-form:visible').length) {
            cy.log('Weight form exists but not visible, forcing visibility');
            cy.get('#add-entry-form').invoke('css', 'display', 'block');
            cy.wait(300);
        } else {
            cy.log('Weight form is already visible');
        }
    });
});

/**
 * Ensures an element is visible before interacting with it
 * Usage: cy.ensureVisible('#elementId')
 */
Cypress.Commands.add('ensureVisible', (selector) => {
    cy.get('body').then(($body) => {
        const $el = $body.find(selector);
        if ($el.length > 0 && !$el.is(':visible')) {
            cy.log(`Making ${selector} visible`);
            cy.get(selector).invoke('css', 'display', 'block');
            cy.wait(200);
        }
    });
});

/**
 * Clicks element with force if not visible
 * Usage: cy.smartClick('#elementId')
 */
Cypress.Commands.add('smartClick', (selector) => {
    cy.get(selector).then(($el) => {
        if ($el.is(':visible')) {
            cy.get(selector).click();
        } else {
            cy.log(`Element ${selector} not visible, using force: true`);
            cy.get(selector).click({ force: true });
        }
    });
});

/**
 * Types into input with force if not visible
 * Usage: cy.smartType('#inputId', 'value')
 */
Cypress.Commands.add('smartType', (selector, value) => {
    cy.get(selector).then(($el) => {
        if ($el.is(':visible')) {
            cy.get(selector).clear().type(value);
        } else {
            cy.log(`Input ${selector} not visible, using force: true`);
            cy.get(selector).clear({ force: true }).type(value, { force: true });
        }
    });
});
