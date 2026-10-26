# Force version to 6.7.14 cause we dont want backoff indexing coming in 6.7.15
FROM rwynn/monstache:6.7.14

# `clever ssh` ouvre un `bash` dans le conteneur : absent de l'image Alpine, il rendait
# le diagnostic impossible (mémoire, processus des workers).
RUN apk add --no-cache bash

ENV MONSTACHE_ES_URLS=""
ENV MONSTACHE_MONGO_URL=""

ARG MONGO_DB_NAME=""
ENV MONGO_DB_NAME=${MONGO_DB_NAME}

COPY collections.csv .
COPY sensitive-fields.csv .
COPY generate_config.sh .
COPY docker_start.sh .

RUN sh generate_config.sh $MONGO_DB_NAME collections.csv sensitive-fields.csv > monstache.toml

ENTRYPOINT ["./docker_start.sh"]
