FROM node:18.16.0-alpine as build

ENV APP_NAME api

WORKDIR /build

COPY . .

RUN --mount=type=cache,target=/build/.npm/cache \
    npx turbo prune --scope=$APP_NAME --out-dir ./out && \
    cd out && \
    npm install && \
    rm -rf node_modules/.cache .npm/cache

FROM node:18.16.0-alpine as api

ENV APP_NAME api
ENV ENV production
ENV PORT 8080
ENV HOST 0.0.0.0

WORKDIR /service-national-universel

COPY --chown=node:node --from=build /build/out .

LABEL org.opencontainers.image.source="https://github.com/betagouv/service-national-universel" \
      org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

EXPOSE $PORT

CMD npm start
