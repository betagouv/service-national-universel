FROM schickling/mailcatcher AS base

RUN apk add nginx

ENV HTTP_USER=

COPY docker_nginx.conf /etc/nginx/http.d/default.conf
COPY docker_start.sh .

EXPOSE 4040
EXPOSE 8080

CMD ["sh", "./docker_start.sh"]
