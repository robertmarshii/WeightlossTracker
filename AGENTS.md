# Repository Guidelines

## Project Structure & Module Organization
- `app/backend/`: PHP 8.2 code (e.g., `Router.php`, `Config.php`, `Get1.php`).
- `app/frontend/`: Entry (`index.php`), route shim (`router.php`), JS (`get.js`, `call.js`).
- `nginx/`, `php-fpm/`: Docker images and config. Root `docker-compose.yml` wires services.
- Root configs: `.env` (Postgres/Xdebug), `nginx.conf`, `php.ini`, `init.sql`, `supervisord.conf`.

## Build, Test, and Development Commands
- Start (build on first run): `docker compose up --build -d`
- View logs: `docker compose logs -f docker-nginx`
- Stop/clean: `docker compose down` (add `-v` to drop volumes)
- PHP lint (in container): `docker compose exec docker-php-fpm php -l /var/app/backend/*.php`
- Smoke test (local): open `http://localhost:8111/` or curl a route, e.g.:
  `curl "http://localhost:8111/router.php?controller=get1"`
- E2E tests (Cypress): `npm install` then `npm run cypress:open` (interactive) or `npm run cypress:run` (headless). Ensure Docker app is running first.
  - Quick DB check: `npm run test:db` runs only the `/test/test.php` spec.

## Coding Style & Naming Conventions
- PHP: Follow PSR-12 (4-space indent). Class names `PascalCase`, methods `camelCase`, constants `UPPER_SNAKE`.
- JS: 2-space indent, single quotes, filenames lower case with hyphens (e.g., `get.js`).
- Routes: `app/frontend/router.php` proxies to `app/backend/Router.php`. Prefer explicit controller names (`get1`) and return JSON.

## Testing Guidelines
- No formal test suite yet. Add lightweight checks:
  - Lint PHP as above; avoid warnings/notices.
  - Endpoint check: `curl -f "http://localhost:8111/router.php?controller=get1"` and assert valid JSON.
- If adding tests, prefer PHPUnit for PHP and place under `tests/` mirroring `app/backend` namespace.
- Cypress lives under `cypress/` with config in `cypress.config.js`. Base URL is `http://localhost:8111`. Add specs in `cypress/e2e/*.cy.js`.
  - Includes a test for `/test/test.php` which prints DB JSON to the body.

## Commit & Pull Request Guidelines
- History is terse; adopt Conventional Commits going forward:
  - `feat: add get1 pagination`, `fix: handle empty results`, `chore: nginx config cleanup`.
- PRs should include: clear description, linked issue (e.g., `Closes #12`), screenshots/logs for user-visible or infra changes, and short testing notes.

## Git Hooks (Local Push Gate)
- Husky pre-push hook runs all Cypress specs via `npm run test:e2e` and blocks push on failure.
- Setup: run `npm install` once to install hooks (via `prepare`).
- Ensure app is running before pushing: `docker compose up -d`.
- Override (rare): `git push --no-verify` (not recommended).

## Agent Shortcuts (Chat Commands)
- `!test`: I will ensure containers are running, then run all Cypress specs (`npm run test:e2e`) and report pass/fail with a concise summary and any failing spec output.
- `!push`: I will ensure containers are running, run all tests, and only if they pass, stage all changes, auto‑generate a Conventional Commit message from the diff, commit, and push the current branch. If tests fail, nothing is committed/pushed and I return the test output.
  - Optional message override: `!push "feat: short description"`.

## Security & Configuration Tips
- `.env` contains credentials; never commit real secrets. Use local overrides and rotate any leaked values.
- Database connection uses Postgres via `Config.php`. Validate inputs, use prepared statements, and avoid echoing raw exceptions in production.
- Public port is `8111`; nginx serves PHP-FPM. Update `nginx/conf.d` for route mapping.
