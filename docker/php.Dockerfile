# PHP 8.2 + Apache (SAPI apache2handler => có getallheaders()) + pdo_mysql
# Dùng cho TEST LOCAL, mô phỏng môi trường shared hosting TinoHost.
FROM php:8.2-apache
RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite
# Cho phép .htaccess (giống cPanel) để test luôn phần chặn db.sql
RUN sed -ri 's/AllowOverride None/AllowOverride All/g' /etc/apache2/apache2.conf
