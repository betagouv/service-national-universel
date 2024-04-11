# * https://turbo.build/repo/docs/handbook/deploying-with-docker
FROM node:18.16.0-alpine AS base

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install --global turbo
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

ENV APP_NAME api
RUN npm run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
USER expressjs

COPY --chown=expressjs:expressjs --from=installer /app .

LABEL org.opencontainers.image.source="https://github.com/betagouv/service-national-universel" \
      org.opencontainers.image.description="This image provides a consistent and reproducible environment for the backend, ensuring it deploys faster and runs the same way regardless of the deployment environment."

ENV APP_NAME api
ENV PORT 8080
ENV HOST 0.0.0.0

EXPOSE $PORT

CMD ["node", "api/src/index.js"]
