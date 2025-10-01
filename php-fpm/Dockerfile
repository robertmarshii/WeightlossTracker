FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    git \
    unzip \
    cron \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_pgsql

RUN pecl install xdebug && docker-php-ext-enable xdebug

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY uploads.ini /usr/local/etc/php/conf.d/uploads.ini

# Set up cron for notification scheduler
RUN mkdir -p /var/app/logs && chmod 777 /var/app/logs
COPY notification-cron /etc/cron.d/notification-cron
RUN chmod 0644 /etc/cron.d/notification-cron

# For dev: create startup script inline to avoid line ending issues
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cron' >> /start.sh && \
    echo 'php-fpm' >> /start.sh && \
    chmod +x /start.sh

# Default CMD for local dev (production uses supervisord via docker-compose override)
CMD ["/start.sh"]
