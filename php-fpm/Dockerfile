FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
    
RUN docker-php-ext-install pdo pdo_pgsql pgsql

RUN pecl install xdebug && docker-php-ext-enable xdebug

COPY uploads.ini /usr/local/etc/php/conf.d/uploads.ini