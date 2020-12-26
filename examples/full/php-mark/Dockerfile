FROM ubuntu:20.04

WORKDIR /app

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y ca-certificates git php-cli php-curl --no-install-recommends && \
	rm -r /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/local/bin/composer
COPY ./composer.* ./
RUN composer install

COPY . .

EXPOSE 5001

CMD [ "php", "server.php", "start" ]
