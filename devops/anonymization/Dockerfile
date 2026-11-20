FROM node:24.22.1-alpine3.23 AS base

RUN apk --no-cache add bash mongodb-tools jq curl util-linux gettext-envsubst
RUN curl -L https://github.com/rwynn/monstache/releases/download/v6.7.14/monstache_v6.7.14_linux_x86_64.tar.gz | tar -xvz && mv monstache /usr/local/bin
# Même version que les workflows (clever-tools 5 exige Node 24+). docker_start.sh n'utilise que
# `login --token --secret`, `stop --app` et `restart --quiet --app`, inchangés depuis la 3.x.
RUN npm install --global --ignore-scripts clever-tools@5.0.2

WORKDIR /build/devops/anonymization

COPY devops/anonymization/package*.json ./
RUN npm ci

COPY devops/anonymization/ ./
COPY api/src/anonymization/ /build/api/src/anonymization/
COPY devops/elastic-search/config/index_whitelist.txt ./config/index_whitelist.txt
COPY devops/elastic-search-datariver/collections.csv /tmp/collections.csv

RUN bash generate_monstache_config.sh '$DB_NAME' /tmp/collections.csv > ./config/monstache-template.toml

ENV SOURCE_DATABASE_URI=
ENV TARGET_DATABASE_URI=
ENV ES_ENDPOINT=

ENTRYPOINT ["bash", "docker_start.sh"]
