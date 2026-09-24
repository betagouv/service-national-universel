#!/bin/bash

set -e

if [ "$#" -lt 1 ]; then
    echo "Build all applications to destination directory"
    echo "Usage $0 <destination>"
    echo "  destination: Build output directory"
    exit 1
fi

destination=$1
if [[ $destination == "" ]]; then
    echo "You must specify the destination directory"
    exit 1
fi

source "$(cd "$(dirname "$0")" && pwd)/copy-packages.sh"
source "$(cd "$(dirname "$0")" && pwd)/csp-report.sh"

cd "$(dirname $0)/../.."

turbo_version=$(cat package-lock.json | grep turbo | head -n 1 | sed 's/"turbo": "\(.*\)"/\1/g')
npm install --global "turbo@$turbo_version"

rm -Rf out
turbo prune app admin api apiv2
cp tsconfig.front.json out
cp -r patches out
cd out
npm ci --no-audit --no-fund
turbo run build
npm ci --omit dev --workspace api --workspace apiv2 --include-workspace-root
cd ..

rm -Rf $destination
mkdir -p $destination

# front
mv out/admin/build $destination/admin
mv out/app/build $destination/app

# back
copy_workspace_packages $destination
mv out/node_modules $destination/

# api
mkdir -p $destination/api/
mv out/api/{src,migrations,public,node_modules} $destination/api/

# apiv2
mkdir -p $destination/apiv2/
mv out/apiv2/{dist/*,node_modules} $destination/apiv2/

# Affectations séparées de l'export : sous `set -e`, un échec de csp_report_uri arrête le build
CSP_REPORT_URI_APP=$(csp_report_uri app)
CSP_REPORT_URI_ADMIN=$(csp_report_uri admin)
export CSP_REPORT_URI_APP CSP_REPORT_URI_ADMIN
envsubst '$APP_HOME $PORT $CSP_REPORT_URI_APP $CSP_REPORT_URI_ADMIN' < devops/build/all/nginx.conf > $destination/nginx.conf
mkdir -p $destination/nginx/{proxy,client}
cp devops/build/all/{package.json,ecosystem.config.js,start-nginx.sh} $destination

rm -Rf out

if [[ $CC_DEPLOYMENT_ID != "" ]]; then
    # CC_NODE_BUILD_TOOL=custom
    # CC_CUSTOM_BUILD_TOOL="VITE_RELEASE=$CC_COMMIT_ID devops/build/build-all.sh /tmp/$APP_ID"
    rm -rf ./*
    mv $destination/* .
fi
