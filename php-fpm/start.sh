#!/bin/sh

# Start cron in background
cron

# Start php-fpm in foreground (keeps container running)
php-fpm
