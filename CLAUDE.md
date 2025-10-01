# CLAUDE.md

This file provides guidance to Claude Code when working with this repository. It serves as a table of contents and quick reference for the WeightlossTracker application.

## 🏗️ Architecture Quick Reference

**Stack**: LAMP (PHP 7.2-FPM + Postgres + Nginx) in Docker containers
**Pattern**: Simple MVC with dual routing system
**Access**: http://localhost:8111 (web) | localhost:3308 (postgres: root/pass)

### 🐳 Docker Configuration
**CRITICAL**: Two separate Dockerfiles for different environments:
- **`php-fpm/Dockerfile`** - Local development (docker-compose.yml) - Uses Debian base (`cron` package), runs via docker-compose
- **`Dockerfile`** (root) - Production/Cloud deployment - Uses Alpine base (`dcron` package), includes nginx+supervisord
- **`supervisord.conf`** - Production only: manages nginx, php-fpm, and crond processes
- **Changes to cron, dependencies, or system setup MUST be made to BOTH Dockerfiles**
- **Cron differences**: Debian uses `/usr/sbin/cron -f` | Alpine uses `/usr/sbin/crond -f`

### 🔀 Dual Router System
- **`login_router.php`** - Public routes (authentication, registration) - No session required
- **`router.php`** - Protected routes (user profile, weight data) - Requires authenticated session

**Frontend API Calls**:
```javascript
// Public authentication (index.js)
$.post('login_router.php?controller=auth', { action: 'send_login_code', email: email })

// Protected user operations (dashboard.js)  
$.post('router.php?controller=profile', { action: 'get_weight_history' })
```

## ⚡ Essential Commands

```bash
# Application
docker compose up -d              # Start application
docker compose down               # Stop application
docker compose logs [service]     # View logs (docker-nginx|docker-php-fpm|postgres)

# Testing & Coverage
npm run cypress:coverage          # Run tests with coverage report
npm run test:coverage            # Run tests + analysis
npm run functions:scan           # Update function inventories
npm run functions:add-comments   # Add coverage docs to tests

# Development
npm run cypress:open             # Open Cypress UI
npm run test:e2e                # Run all e2e tests
```

## 📁 Directory Structure

```
app/
├── frontend/          # PHP/HTML/JavaScript (jQuery)
└── backend/           # PHP classes (AuthManager, Database, etc.)
nginx/                 # Web server config
php-fpm/              # PHP runtime config  
cypress/e2e/          # End-to-end tests
js/                   # Shared JavaScript (global.js, coverage.js)
css/                  # Shared CSS (global.css)
.claude/              # Claude-specific files (docs, scripts, reports)
seeders/              # Database seeding files
```

## 📚 Documentation Index

- **`CLAUDE.md`** - This file: Quick reference and table of contents
- **`.claude/docs/COVERAGE-SYSTEM-README.md`** - Complete coverage system guide
- **`.claude/docs/AGENTS.md`** - Claude Code agents documentation
- **`.claude/reports/all_frontend_functions.txt`** - JavaScript function inventory (96 functions)  
- **`.claude/reports/all_backend_functions.txt`** - PHP function inventory (82 functions)
- **`.claude/reports/cypress-coverage-report.txt`** - Auto-generated test coverage reports
- **`.claude/scripts/`** - Coverage system scripts (generate-function-inventory.js, etc.)

## 📊 Code Coverage System (Quick Reference)

**Purpose**: Track JavaScript & PHP function execution during Cypress tests to identify coverage gaps.

**Key Files**: 
- `js/coverage.js` - Client-side logging
- `app/backend/CoverageLogger.php` - Server-side logging  
- `scripts/generate-function-inventory.js` - Function scanning
- `cypress/support/coverage-*` - Test integration

**Essential Coverage Commands**:
```javascript
// In Cypress tests
cy.verifyCoverage(['showAlert', 'parseJson'], 'Test Description');
cy.getCoverageStats();
cy.assertFunctionTested('functionName');
```

**Critical Functions to Test**:
- Frontend: `showAlert`, `parseJson`, `isValidEmail`, `sendLoginCode`
- Backend: `AuthManager::sendLoginCode`, `AuthManager::verifyLoginCode`, `AuthManager::checkRateLimit`

**📖 For complete coverage system documentation, workflows, troubleshooting, and examples, see `COVERAGE-SYSTEM-README.md`**

## 🔧 Development Notes

**Environment-Specific Features**:
- Test Interface button visible only on `127.0.0.1:8111` (development)
- Coverage logging enabled automatically during test runs
- Function inventories update automatically when code changes

**File Organization**:
- `css/global.css` + `js/global.js` - Shared code between index.php and dashboard.php
- Separate CSS/JS files reduce code duplication by ~450 lines
- Coverage instrumentation is automatic for tracked JavaScript functions

## ⚠️ CRITICAL ARCHITECTURAL PRESERVATION RULES

### **🚨 NEVER BREAK THE GLOBAL DATA SYSTEM**
The global data system (commit f382580) is PRODUCTION-CRITICAL and FRAGILE:
- `testConsolidatedDashboardData()` MUST be called first in dashboard.js
- Individual functions MUST check `window.globalDashboardData` before API calls
- ONE consolidated API call replaces 10+ individual calls - preserve this optimization
- ANY automatic instrumentation can trigger fallback individual calls = BROKEN

### **🛡️ PRODUCTION-FIRST DEVELOPMENT**
- Testing tools MUST be opt-in only (`?coverage=1` parameter)
- NEVER auto-enable coverage or instrumentation
- User experience trumps testing convenience
- Global optimizations are sacred

### **🔒 TEST STABILITY RULES**
**NEVER change HTML element IDs, classes, or selectors in existing code**:
- `#loginEmail`, `#sendLoginCodeBtn`, `#loginForm`, `#loginCode`, `#verifyLoginForm` - Authentication
- `#signupEmail`, `#signupCode`, `#verifySignupForm`, `#agreeTerms` - Registration
- `#weightKg`, `#newWeight`, `#newDate`, `#add-entry-form`, `#heightCm` - Dashboard forms
- `#goalWeight`, `#goalDate`, `#btn-add-weight`, `#btn-save-goal` - Goal management
- `.glass-card`, `.glass-card-small`, `.nav-link`, `.nav-tabs` - UI components

**Changing these breaks ALL Cypress tests**. Only modify selectors if explicitly requested and update ALL affected test files simultaneously.

## 📂 Claude File Organization Rules

**IMPORTANT**: All Claude-generated files, scripts, logs, and documentation (except CLAUDE.md) should be created in the `.claude/` folder:

- **`.claude/docs/`** - Documentation files (*.md, guides, examples)
- **`.claude/scripts/`** - Build scripts, coverage tools, utilities  
- **`.claude/reports/`** - Generated reports, function inventories, coverage data
- **`.claude/settings.local.json`** - Claude Code configuration

**Never create these in project root**: coverage reports, function inventories, analysis scripts, or temporary files.