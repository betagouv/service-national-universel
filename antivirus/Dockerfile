FROM node:18.16.0-alpine as build

ENV APP_NAME antivirus

WORKDIR /build

COPY . .

RUN --mount=type=cache,target=/build/.npm/cache \
    npx turbo prune --scope=$APP_NAME --out-dir ./out && \
    cd out && \
    npm install && \
    rm -rf node_modules/.cache .npm/cache

FROM node:18.16.0-alpine as antivirus

ENV APP_NAME antivirus
ENV ENV production
ENV PORT 8080
ENV HOST 0.0.0.0

WORKDIR /service-national-universel

RUN apk update && \
    apk add clamav clamav-libunrar && \
    freshclam

COPY --chown=node:node --from=build /build/out .

RUN echo "TCPSocket 3310" > /etc/clamav/clamd.conf
RUN echo "TCPAddr 127.0.0.1" >> /etc/clamav/clamd.conf

RUN chmod +x /service-national-universel/antivirus/start.sh

LABEL org.opencontainers.image.source="https://github.com/betagouv/service-national-universel" \
    org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

EXPOSE $PORT

CMD ["/service-national-universel/antivirus/start.sh"]
