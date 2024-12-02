FROM node:20.17-alpine AS base

RUN apk add nginx supervisor

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY packages/lib/package.json packages/lib/
COPY packages/ds/package.json packages/ds/
COPY api/package.json api/
COPY apiv2/package.json apiv2/
COPY app/package.json app/
COPY admin/package.json admin/

# public directory required by copy:dsfr
RUN mkdir admin/public app/public

RUN --mount=type=cache,target=/root/.npm npm ci

COPY tsconfig.front.json .
COPY turbo.json .
COPY packages/ packages/
COPY api/ api/
COPY apiv2/ apiv2/
COPY app/ app/
COPY admin/ admin/

ARG ENVIRONMENT
ARG RELEASE
ARG DOMAIN
ARG VITE_SUPPORT_URL
ARG VITE_MAINTENANCE
ARG VITE_SENTRY_SESSION_SAMPLE_RATE
ARG VITE_SENTRY_TRACING_SAMPLE_RATE
ARG VITE_SENTRY_ON_ERROR_SAMPLE_RATE
ARG VITE_FRANCE_CONNECT_URL
ARG VITE_API_ENGAGEMENT_URL
ARG VITE_API_ENGAGEMENT_SNU_ID

ENV VITE_ENVIRONMENT=${ENVIRONMENT}
ENV VITE_RELEASE=${RELEASE}
ENV ENVIRONMENT=${ENVIRONMENT}
ENV RELEASE=${RELEASE}
ENV API_URL=https://api.${DOMAIN}
ENV APIV2_URL=https://api.${DOMAIN}/v2
ENV APP_URL=https://moncompte.${DOMAIN}
ENV ADMIN_URL=https://admin.${DOMAIN}
ENV VITE_API_URL=${API_URL}
ENV VITE_APIV2_URL=${APIV2_URL}
ENV VITE_APP_URL=${APP_URL}
ENV VITE_ADMIN_URL=${ADMIN_URL}

WORKDIR /app/packages/ds
RUN npm run build

WORKDIR /app/packages/lib
RUN npm run build

WORKDIR /app/api
RUN npm run build

WORKDIR /app/apiv2
RUN npm run build

WORKDIR /app/admin
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) \
    npm run build

WORKDIR /app/app
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) \
    npm run build

WORKDIR /app

COPY /devops/ci/nginx.conf /etc/nginx/http.d/default.conf
COPY /devops/ci/supervisord.ini /etc/supervisor.d/

EXPOSE 80

CMD ["supervisord"]
