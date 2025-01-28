# * https://turbo.build/repo/docs/handbook/deploying-with-docker
FROM node:20.17-alpine AS base
ENV APP_NAME="api"

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install --global turbo@^2.0.0
COPY . .
RUN turbo prune $APP_NAME --docker && cp -fr patches out/full/

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/full/packages/ ./packages/
COPY --from=builder /app/out/full/patches/ ./patches/
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN npm run build

FROM base AS runner
WORKDIR /app

COPY --from=installer /app .

LABEL org.opencontainers.image.source="https://github.com/betagouv/service-national-universel"


ENV PATH=/app/node_modules/pm2/bin/:$PATH

ARG ENVIRONMENT
ARG RELEASE
ARG PM2_SLACK_URL

ENV ENVIRONMENT=${ENVIRONMENT}
ENV RELEASE=${RELEASE}

RUN pm2 install --docker pm2-slack
RUN --mount=type=secret,id=PM2_SLACK_URL \
      pm2 --silent set "pm2-slack:slack_url" "$(cat /run/secrets/PM2_SLACK_URL)"
RUN pm2 --silent set "pm2-slack:servername" "PM2-ERROR-API"
RUN pm2 --silent set "pm2-slack:error" "false"

EXPOSE 8080

CMD ["api/docker_start.sh"]
