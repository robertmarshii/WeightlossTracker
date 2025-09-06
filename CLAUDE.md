# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a WeightlossTracker application built with a traditional LAMP stack using Docker containers:

- **Frontend**: PHP/HTML/JavaScript (jQuery) located in `app/frontend/`
- **Backend**: PHP with PDO/MySQL located in `app/backend/`
- **Database**: MySQL 5.7 with sample schema in `init.sql`
- **Web Server**: Nginx serving as reverse proxy and static file server
- **PHP Runtime**: PHP 7.2-FPM with MySQL extensions

The application follows a simple MVC-like pattern:
- Frontend makes AJAX calls to `router.php`
- Router dispatches requests to appropriate backend controllers
- Backend classes handle database operations using a singleton Database class
- Database connection configured for Docker MySQL service

## Development Commands

**Start the application:**
```bash
docker compose up -d
```

**Stop the application:**
```bash
docker compose down
```

**Access the application:**
- Web interface: http://localhost:8111
- MySQL database: localhost:3308 (root/pass, user/password)

**View logs:**
```bash
docker compose logs [service-name]
```
Where service-name can be: docker-nginx, docker-php-fpm, or mysql

## Docker Services

- **docker-nginx**: Nginx web server on port 8111, serves frontend and proxies PHP requests
- **docker-php-fpm**: PHP-FPM container with MySQL PDO extensions and Xdebug
- **mysql**: MySQL 5.7 database with initialization from `init.sql`

All services are connected via `web-network` and volumes are mounted for live development.

## File Structure

- `app/frontend/`: Client-side code (HTML, JavaScript, router)
- `app/backend/`: Server-side PHP classes and controllers  
- `nginx/`: Nginx Docker configuration and site config
- `php-fpm/`: PHP-FPM Docker configuration with extensions
- `init.sql`: Database initialization script with sample data