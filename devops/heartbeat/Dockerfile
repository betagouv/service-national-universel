FROM debian:bullseye-slim

ENV HEARTBEAT_VERSION=8.6.1

# Dépendances nécessaires
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    libcap2-bin \
    socat \
    gettext-base \
    && rm -rf /var/lib/apt/lists/*

# Installation de Heartbeat (x86_64 pour CleverCloud)
RUN curl -L -O https://artifacts.elastic.co/downloads/beats/heartbeat/heartbeat-${HEARTBEAT_VERSION}-amd64.deb \
    && dpkg -i heartbeat-${HEARTBEAT_VERSION}-amd64.deb \
    && rm heartbeat-${HEARTBEAT_VERSION}-amd64.deb

# Ajout du fichier de configuration
COPY heartbeat.yml.template /etc/heartbeat/heartbeat.yml.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]