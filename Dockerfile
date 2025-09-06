# Start from an official PHP image with FPM (Alpine)
FROM php:8.2-fpm-alpine

# Install nginx + supervisord + PostgreSQL runtime libs
# Then build PHP pgsql extensions using Alpine dev headers
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

# (Optional) align permissions (depends on your nginx.conf/php-fpm pool)
# If your nginx.conf runs as 'nginx', leave this as-is.
# If you serve static files from /var/www, ensure nginx can read them.
# If php-fpm runs as www-data (default), it already owns PHP app paths.
RUN addgroup -S app && adduser -S app -G app; \
    chown -R app:app /var/app || true; \
    chown -R app:app /var/www || true

# Copy application
COPY app/backend /var/app/backend
COPY app/frontend /var/www

# Copy configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Custom PHP config
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Expose HTTP
EXPOSE 80

# Optional healthcheck (requires curl; uncomment if you add curl)
# RUN apk add --no-cache curl
# HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
#   CMD curl -fsS http://127.0.0.1/ || exit 1

# Run nginx + php-fpm via supervisord
CMD ["/usr/bin/supervisord","-c","/etc/supervisord.conf"]
