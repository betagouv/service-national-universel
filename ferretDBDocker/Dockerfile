# Use the official FerretDB image as a base
FROM ghcr.io/ferretdb/ferretdb:latest

# Install bash and curl for testing
RUN apt-get update && apt-get install -y bash curl

# Set environment variables directly in the Dockerfile
ENV FERRETDB_POSTGRESQL_URL=mettre_url

# Expose the port FerretDB will listen on
EXPOSE 27017

# The official entrypoint for FerretDB is automatically set in the base image.
