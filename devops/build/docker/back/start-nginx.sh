#!/bin/sh

waitForUpstream() {
    until curl --output /dev/null --silent --head $1; do
        sleep 2
    done
}

waitForUpstream "http://127.0.0.1:3000" # api
waitForUpstream "http://127.0.0.1:3001" # apiv2

exec nginx -g "daemon off;"
