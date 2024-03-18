FROM node:18.16.0-alpine AS base



FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install --global turbo
COPY . .
ENV APP_NAME admin
RUN turbo prune $APP_NAME --docker



# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
# command sh -c node src/build-only-on-clevercloud.js
COPY --from=builder /app/out/full/admin/src/build-only-on-clevercloud.js ./admin/src/build-only-on-clevercloud.js
# copy:dsfr
RUN mkdir ./admin/public
# snu-lib rollup -c
COPY --from=builder /app/out/full/packages/ ./packages/
RUN npm install

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

ENV APP_NAME admin
RUN npm run build


FROM nginx AS runner

LABEL org.opencontainers.image.source=https://github.com/betagouv/service-national-universel
LABEL org.opencontainers.image.description="This image provides a consistent and reproducible environment for the admin, ensuring it deploys faster and runs the same way regardless of the deployment environment."

COPY --from=installer /app/admin/build/ /usr/share/nginx/html
COPY --from=builder /app/admin/docker_start.sh .
COPY --from=builder /app/admin/docker_nginx.conf /etc/nginx/templates/default.conf.template

RUN chmod +x ./docker_start.sh

EXPOSE 8080

# override default entrypoint
ENTRYPOINT ["./docker_start.sh"]
