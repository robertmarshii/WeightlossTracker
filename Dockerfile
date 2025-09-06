# Start from an official PHP image with FPM and nginx
FROM php:8.2-fpm-alpine

# Install nginx
RUN apk add --no-cache nginx supervisor

# Install necessary PHP extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql mysqli

# Create nginx run directory
RUN mkdir -p /run/nginx

# Copy website files
COPY app/backend /var/app/backend
COPY app/frontend /var/www

# Copy nginx and supervisor configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisord.conf /etc/supervisord.conf

# Copy your custom php.ini into the container
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Expose port 80
EXPOSE 80

# Run both nginx and php-fpm via supervisord
CMD ["/usr/bin/supervisord","-c","/etc/supervisord.conf"]
# End of Dockerfile