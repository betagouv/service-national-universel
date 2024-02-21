FROM node:18.16.0-alpine as build

ENV APP_NAME pdf

WORKDIR /build

COPY . .

RUN --mount=type=cache,target=/build/.npm/cache \
    npx turbo prune --scope=$APP_NAME --out-dir ./out && \
    cd out && \
    npm install && \
    rm -rf node_modules/.cache .npm/cache

FROM node:18.16.0-alpine as runtime

ENV APP_NAME pdf
ENV PORT 8087
ENV HOST 0.0.0.0
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /service-national-universel

RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates


COPY --chown=node:node --from=build /build/out .

LABEL org.opencontainers.image.source="https://github.com/betagouv/service-national-universel"

# Create a non-root user and switch to it
RUN adduser -D appuser
USER appuser


EXPOSE $PORT

CMD npm start
