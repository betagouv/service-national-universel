FROM node:20.17-alpine AS base


FROM base AS pruner
WORKDIR /build

RUN --mount=type=bind,src=package-lock.json,target=/tmp/package-lock.json \
    --mount=type=cache,target=/root/.npm \
<<EOF
turbo_version=$(cat /tmp/package-lock.json | grep turbo | head -n 1 | sed 's/"turbo": "\(.*\)"/\1/g')
npm install --global "turbo@$turbo_version"
EOF

RUN --mount=type=bind,src=api,target=/tmp/api \
    --mount=type=bind,src=apiv2,target=/tmp/apiv2 \
    --mount=type=bind,src=admin,target=/tmp/admin \
    --mount=type=bind,src=app,target=/tmp/app \
    --mount=type=bind,src=patches,target=/tmp/patches \
    --mount=type=bind,src=packages,target=/tmp/packages \
    --mount=type=bind,src=package.json,target=/tmp/package.json \
    --mount=type=bind,src=package-lock.json,target=/tmp/package-lock.json \
    --mount=type=bind,src=turbo.json,target=/tmp/turbo.json \
    turbo prune --docker --cwd /tmp --out-dir /build app admin api apiv2 && cp -fr /tmp/patches /build/json/


FROM base AS builder
WORKDIR /build

COPY --from=pruner /build/json/ .
RUN mkdir admin/public app/public
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

ARG ENVIRONMENT
ARG RELEASE

ENV VITE_ENVIRONMENT=${ENVIRONMENT}
ENV VITE_RELEASE=${RELEASE}

COPY --from=pruner /build/full/ .
RUN --mount=type=bind,src=tsconfig.front.json,target=/build/tsconfig.front.json \
    --mount=type=secret,id=BUILD_SECRETS \
<<EOF
    export $(cat /run/secrets/BUILD_SECRETS | xargs)
    npx turbo run build
EOF

RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit dev --workspace api --workspace apiv2 --include-workspace-root


FROM base AS runner

RUN apk add nginx supervisor

COPY /devops/ci/nginx.conf /etc/nginx/http.d/default.conf
COPY /devops/ci/supervisord.ini /etc/supervisor.d/

WORKDIR /app

COPY --from=builder /build/admin/build/ admin/build/
COPY --from=builder /build/app/build/ app/build/

COPY --from=builder /build/packages/lib/dist/ packages/lib/dist/
COPY --from=builder /build/packages/lib/node_modules/ packages/lib/node_modules/
COPY --from=builder /build/packages/lib/package.json packages/lib/

COPY --from=builder /build/apiv2/dist/ apiv2/
COPY --from=builder /build/apiv2/node_modules/ apiv2/node_modules/
COPY --from=builder /build/apiv2/package.json apiv2/

COPY --from=builder /build/api/src/ api/src/
COPY --from=builder /build/api/migrations/ api/migrations/
COPY --from=builder /build/api/public/ api/public/
COPY --from=builder /build/api/node_modules/ api/node_modules/
COPY --from=builder /build/api/package.json api/

COPY --from=builder /build/package.json ./
COPY --from=builder /build/patches/ patches/
COPY --from=builder /build/node_modules/ node_modules/


ARG ENVIRONMENT
ARG RELEASE

ENV ENVIRONMENT=${ENVIRONMENT}
ENV RELEASE=${RELEASE}

EXPOSE 8080

CMD ["supervisord"]
