FROM node:20.17-alpine AS base

RUN apk --no-cache add bash mongodb-tools jq curl util-linux gettext-envsubst
RUN curl -L https://github.com/rwynn/monstache/releases/download/v6.7.14/monstache_v6.7.14_linux_x86_64.tar.gz | tar -xvz && mv monstache /usr/local/bin

WORKDIR /build/devops/anonymization

COPY devops/anonymization/package*.json ./
RUN npm ci

COPY devops/anonymization/ ./
COPY api/src/anonymization/ /build/api/src/anonymization/
COPY devops/elastic-search/config/index_whitelist.txt ./config/index_whitelist.txt

RUN --mount=type=bind,src=devops/elastic-search-datariver/collections.csv,target=/tmp/collections.csv \
    bash generate_monstache_config.sh '$DB_NAME' /tmp/collections.csv > ./config/monstache-template.toml

ENV SOURCE_DATABASE_URI=
ENV TARGET_DATABASE_URI=
ENV ES_ENDPOINT=

ENTRYPOINT ["bash", "docker_start.sh"]
