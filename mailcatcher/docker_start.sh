#!/bin/bash

set -ex

echo $HTTP_USER > /.htpasswd

mailcatcher --no-quit --ip=0.0.0.0 --smtp-port=4040 --http-port=1080 --http-path $HTTPPATH

# Start nginx
exec nginx -g "daemon off;"
