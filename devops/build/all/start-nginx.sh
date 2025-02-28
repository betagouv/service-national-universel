#!/bin/bash

waitForUpstream() {
    until curl --output /dev/null --silent --head $1; do
        printf '.'
        sleep 5
    done
}

waitForUpstream "http://127.0.0.1:3000" # api
waitForUpstream "http://127.0.0.1:3006" # apiv2

exec nginx -c nginx.conf