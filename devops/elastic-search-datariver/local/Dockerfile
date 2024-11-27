# Force version to 6.7.14 cause we dont want backoff indexing coming in 6.7.15
FROM rwynn/monstache:6.7.14

COPY collections.csv .
COPY generate_config.sh .

ARG MONGO_DB_NAME
ENV MONSTACHE_ES_URLS=
ENV MONSTACHE_MONGO_URL=

RUN sh generate_config.sh $MONGO_DB_NAME collections.csv > monstache.toml
RUN sed -i -e '/^workers =/d' -e '/^cluster-name =/d' monstache.toml

EXPOSE 8080
ENTRYPOINT ["monstache", "-f", "monstache.toml", "--enable-http-server" ]
