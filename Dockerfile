# Start from an official PHP image with FPM (Alpine)
FROM php:8.2-fpm-alpine

# Install nginx + supervisord + PostgreSQL runtime libs
RUN set -eux; \
    apk add --no-cache \
        nginx \
        supervisor \
        postgresql-libs; \
    apk add --no-cache --virtual .build-deps \
        $PHPIZE_DEPS \
        postgresql-dev; \
    docker-php-ext-install -j"$(nproc)" pdo pdo_pgsql pgsql; \
    apk del .build-deps

# Create nginx run directory (pid/socket) and logs dir
RUN mkdir -p /run/nginx /var/log/nginx

# Copy application
COPY app/backend /var/app/backend
COPY app/frontend /var/www

# Copy configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Custom PHP config
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Run nginx + php-fpm via supervisord
CMD ["/usr/bin/supervisord","-c","/etc/supervisord.conf"]
