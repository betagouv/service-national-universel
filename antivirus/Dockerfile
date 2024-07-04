FROM node:18.20-alpine as build

ENV APP_NAME antivirus

WORKDIR /build

COPY . .

RUN --mount=type=cache,target=/build/.npm/cache \
    npx turbo@^1.1.13 prune --scope=$APP_NAME --out-dir ./out && \
    cd out && \
    npm install && \
    rm -rf node_modules/.cache .npm/cache

FROM node:18.20-alpine as antivirus

ENV APP_NAME antivirus
ENV ENV production
ENV PORT 8080
ENV HOST 0.0.0.0

RUN apk update && \
    apk add clamav

RUN mkdir /run/clamav
RUN chown -R clamav:clamav /run/clamav/
RUN sed -i -e 's/^NotifyClamd/#NotifyClamd/g' /etc/clamav/freshclam.conf
RUN sed -i -e 's/^#ConcurrentDatabaseReload no/ConcurrentDatabaseReload no/g' /etc/clamav/clamd.conf
RUN freshclam

WORKDIR /service-national-universel


COPY --chown=node:node --from=build /build/out .

RUN chmod +x /service-national-universel/antivirus/docker_start.sh

LABEL org.opencontainers.image.source="https://github.com/betagouv/service-national-universel" \
    org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

ARG RELEASE=""
ENV RELEASE=${RELEASE}

EXPOSE $PORT

CMD ["/service-national-universel/antivirus/docker_start.sh"]
