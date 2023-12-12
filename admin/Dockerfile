FROM node:18.16.0-alpine as build

ENV APP_NAME admin
ENV MODE production
ENV CI true

WORKDIR /build

COPY . .
RUN --mount=type=cache,target=/build/.npm/cache \
    npx turbo prune --scope=$APP_NAME --out-dir ./out && \
    cd out && \
    cp admin/docker.env admin/.env && \
    npm install && \
    npm run build && \
    rm -rf node_modules/.cache .npm/cache


FROM node:18.16.0-alpine as admin

ENV APP_NAME admin
ENV PORT 8080

WORKDIR /service-national-universel

COPY --chown=node:node --from=build /build/out .
RUN chmod +x admin/docker-env.sh

LABEL org.opencontainers.image.source=https://github.com/betagouv/service-national-universel
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the admin, ensuring it deploys faster and runs the same way regardless of the deployment environment."

EXPOSE $PORT

CMD ./admin/docker-env.sh && npm start
