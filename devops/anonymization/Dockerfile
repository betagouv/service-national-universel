FROM node:20.17-alpine AS base

WORKDIR /app

RUN apk --no-cache add bash mongodb-tools jq curl util-linux

COPY devops/anonymization devops/anonymization
COPY api/src/anonymization api/src/anonymization

WORKDIR /app/devops/anonymization

RUN npm ci

ARG SOURCE_DATABASE_URI
ARG TARGET_DATABASE_URI

ENV SOURCE_DATABASE_URI=${SOURCE_DATABASE_URI}
ENV TARGET_DATABASE_URI=${TARGET_DATABASE_URI}

CMD ["bash", "docker_start.sh"]
