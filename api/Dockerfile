# * https://turbo.build/repo/docs/handbook/deploying-with-docker
FROM node:18.20-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install --global turbo@^1.13.3
COPY . .
ENV APP_NAME api
RUN turbo prune $APP_NAME --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/full/packages/ ./packages/
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

ARG RELEASE=""
ENV RELEASE=${RELEASE}
ARG SENTRY_AUTH_TOKEN=""
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}
ENV APP_NAME api
RUN npm run build

FROM base AS runner
WORKDIR /app

RUN apk --no-cache add bash mongodb-tools jq curl util-linux rsyslog rsyslog-elasticsearch rsyslog-mmjsonparse

COPY --from=installer /app .

LABEL org.opencontainers.image.source="https://github.com/betagouv/service-national-universel" \
      org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

ENV APP_NAME api
ENV PORT 8080
ENV HOST 0.0.0.0
ARG RELEASE=""
ENV RELEASE=${RELEASE}
ENV NODE_CONFIG_DIR=/app/api/config

ENV PATH=/app/node_modules/pm2/bin/:$PATH

EXPOSE $PORT

RUN pm2 install --docker pm2-slack

CMD ["api/docker_start.sh"]
