# Start from an official PHP image with FPM (Alpine)
FROM php:8.4.27-fpm-alpine

# Install nginx + supervisord + PostgreSQL runtime libs + curl for composer + dcron
RUN set -eux; \
    apk add --no-cache \
        nginx \
        supervisor \
        postgresql-libs \
        curl \
        unzip \
        dcron; \
    apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        postgresql-dev; \
    docker-php-ext-install -j"$(nproc)" pdo pdo_pgsql pgsql; \
    apk del .build-deps

# Create nginx directories (user already exists from nginx package)
RUN mkdir -p /run/nginx /var/log/nginx /var/cache/nginx && \
    chown -R nginx:nginx /run/nginx /var/log/nginx /var/cache/nginx

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application
COPY app/backend /var/app/backend
COPY app/frontend /var/www
# Test pages and editor backup copies never ship in the production image
RUN rm -rf /var/www/test && find /var/www -type f \( -name '*.bak' -o -name '*.backup' -o -name '*.old' -o -name '*.orig' -o -name '*.swp' \) -delete

# Copy composer files and install dependencies
COPY composer.json composer.lock /var/app/project/
WORKDIR /var/app/project
RUN composer install --no-dev --optimize-autoloader

# Copy configs
COPY nginx/nginx.prod.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Custom PHP config
COPY /php-fpm/php.ini /usr/local/etc/php/conf.d/custom.ini

# Set up cron for notification scheduler: runs as www-data (dcron per-user crontab), logs dir owned by www-data
RUN mkdir -p /var/app/logs /var/app/data && \
    chown www-data:www-data /var/app/logs /var/app/data && \
    chmod 750 /var/app/logs && chmod 700 /var/app/data
COPY php-fpm/notification-crontab /etc/crontabs/www-data
RUN chown root:root /etc/crontabs/www-data && chmod 0600 /etc/crontabs/www-data

# Set proper permissions: code is owned by root and read-only for php-fpm (www-data)
RUN chown -R root:root /var/www /var/app/backend && \
    chmod -R u=rwX,go=rX /var/www /var/app/backend

# Set PHP configurations
RUN echo "pm.max_children = 50" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.start_servers = 10" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.min_spare_servers = 5" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "pm.max_spare_servers = 15" >> /usr/local/etc/php-fpm.d/www.conf
RUN echo "max_input_vars = 11000" > /usr/local/etc/php/conf.d/custom-php.ini

# Version for /status: Easypanel passes the commit being built as the GIT_SHA build argument.
ARG GIT_SHA=""
RUN mkdir -p /srv && printf '%s\n' "${GIT_SHA:-unknown}" > /srv/git-sha

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/index.php || exit 1

# Run nginx + php-fpm via supervisord
CMD ["/usr/bin/supervisord","-c","/etc/supervisord.conf"]
