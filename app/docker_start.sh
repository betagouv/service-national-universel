#!/bin/sh

set -ex

cd /usr/share/nginx/html

mv index.html index.html.template

sed '/<noscript> You need to enable JavaScript to run this app. <\/noscript>/a\
<script> \
    globalThis.runtime_env = { \
        "API_URL":"$API_URL", \
        "APP_URL":"$APP_URL", \
        "ADMIN_URL":"$ADMIN_URL", \
        "SUPPORT_URL":"$SUPPORT_URL", \
        "MAINTENANCE":"$MAINTENANCE", \
        "SENTRY_URL":"$SENTRY_URL", \
        "SENTRY_TRACING_SAMPLE_RATE":"$SENTRY_TRACING_SAMPLE_RATE", \
        "SENTRY_SESSION_SAMPLE_RATE":"$SENTRY_SESSION_SAMPLE_RATE", \
        "SENTRY_ON_ERROR_SAMPLE_RATE":"$SENTRY_ON_ERROR_SAMPLE_RATE", \
        "FRANCE_CONNECT_URL":"$FRANCE_CONNECT_URL" \
        "API_ENGAGEMENT_URL":"$API_ENGAGEMENT_URL" \
        "API_ENGAGEMENT_SNU_ID":"$API_ENGAGEMENT_SNU_ID" \
    }; \
</script> \
' index.html.template \
| envsubst > index.html

cd -

# Start nginx
exec /docker-entrypoint.sh nginx -g "daemon off;"
