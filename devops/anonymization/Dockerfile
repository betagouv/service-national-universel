FROM node:20.17-alpine AS base

WORKDIR /app

RUN pwd
RUN apk --no-cache add bash mongodb-tools jq curl util-linux

COPY devops/anonymization devops/anonmyization
COPY api/src/anonymization api/src/anonymization

RUN ls -R .

ARG SOURCE_DATABASE_URI
ARG TARGET_DATABASE_URI

ENV SOURCE_DATABASE_URI=${SOURCE_DATABASE_URI}
ENV TARGET_DATABASE_URI=${TARGET_DATABASE_URI}

CMD ["devops/anonmyization/anonymize_db.sh"]
