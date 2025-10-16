@echo off
echo ========================================
echo Starting Docker Containers...
echo ========================================
docker compose up -d

echo.
echo Waiting for containers to be ready...
timeout /t 10 /nobreak

echo.
echo ========================================
echo Running Cypress Tests...
echo ========================================
npx cypress run --config-file cypress.config.js --headless

echo.
echo ========================================
echo Tests Complete!
echo ========================================
pause
