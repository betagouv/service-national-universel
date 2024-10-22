# Force version to 6.7.14 cause we dont want backoff indexing coming in 6.7.15
FROM rwynn/monstache:6.7.14

ENV MONSTACHE_ES_URLS=""
ENV MONSTACHE_MONGO_URL=""

ARG MONGO_DB_NAME=""
ENV MONGO_DB_NAME=${MONGO_DB_NAME}

COPY collections.csv .
COPY generate_config.sh .
COPY docker_start.sh .

RUN sh generate_config.sh $MONGO_DB_NAME collections.csv > monstache.toml

ENTRYPOINT ["./docker_start.sh"]
