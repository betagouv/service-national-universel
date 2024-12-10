FROM node:20.17-alpine AS base
ENV APP_NAME="app"

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install --global turbo@^2.0.0
COPY . .
RUN turbo prune $APP_NAME --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .

# copy:dsfr
RUN mkdir ./app/public
# snu-lib rollup -c
COPY --from=builder /app/out/full/packages/ ./packages/
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
COPY tsconfig.front.json tsconfig.front.json

ARG ENVIRONMENT
ARG RELEASE

ENV VITE_ENVIRONMENT=${ENVIRONMENT}
ENV VITE_RELEASE=${RELEASE}
ARG VITE_API_URL
ARG VITE_APIV2_URL
ARG VITE_APP_URL
ARG VITE_ADMIN_URL
ARG VITE_SUPPORT_URL
ARG VITE_KNOWLEDGEBASE_URL
ARG VITE_MAINTENANCE
ARG VITE_SENTRY_SESSION_SAMPLE_RATE
ARG VITE_SENTRY_TRACING_SAMPLE_RATE
ARG VITE_SENTRY_ON_ERROR_SAMPLE_RATE
ARG VITE_FRANCE_CONNECT_URL
ARG VITE_API_ENGAGEMENT_URL
ARG VITE_API_ENGAGEMENT_SNU_ID

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) \
    npm run build

FROM nginx AS runner

LABEL org.opencontainers.image.source=https://github.com/betagouv/service-national-universel
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the app (mon-compte), ensuring it deploys faster and runs the same way regardless of the deployment environment."

COPY --from=installer /app/app/build/ /usr/share/nginx/html
COPY --from=builder /app/app/docker_nginx.conf /etc/nginx/templates/default.conf.template

ARG NGINX_HOSTNAME=""
RUN sed "s/\${NGINX_HOSTNAME}/${NGINX_HOSTNAME}/g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/templates/default.conf.template

EXPOSE 8080
