#!/bin/bash

set -e

if [ "$#" -lt 2 ]; then
    echo "Build application to destination directory"
    echo "Usage $0 <application> <destination>"
    echo "  application: Application name (app, admin, api, apiv2, snupport-app, snupport-api)"
    echo "  destination: Build output directory"
    exit 1
fi

application=$1
destination=$2

case $application in
    (app | admin | api | apiv2 | snupport-app | snupport-api) ;;
    (*)
        echo "You must specify a valid application"
        exit 1
    ;;
esac

if [[ $destination == "" ]]; then
    echo "You must specify the destination directory"
    exit 1
fi

front=0
back=0
use_packages=0
use_patches=0
copy_tsconfig=0

if [[ $application == "api" || $application == "apiv2" ]]; then
    back=1;
    use_packages=1;
    use_patches=1;
fi
if [[ $application == "app" || $application == "admin" ]]; then
    front=1;
    copy_tsconfig=1;
fi
if [[ $application == "snupport-api" ]]; then
    back=1;
fi
if [[ $application == "snupport-app" ]]; then
    front=1;
fi

cd "$(dirname $0)/../.."

turbo_version=$(cat package-lock.json | grep turbo | head -n 1 | sed 's/"turbo": "\(.*\)"/\1/g')
npm install --global --ignore-scripts "turbo@$turbo_version"

rm -Rf out
turbo prune $application
if (( $copy_tsconfig )); then
    cp tsconfig.front.json out
fi
if (( $use_patches )); then
    cp -r patches out
fi
cd out
npm ci --no-audit --no-fund --ignore-scripts
turbo run build
if (( $back )); then
    npm ci --omit dev --workspace $application --include-workspace-root --ignore-scripts
fi
cd ..

rm -Rf $destination
mkdir -p $destination

if (( $front )); then
    mv out/$application/build $destination
    envsubst '$APP_HOME $PORT' < devops/build/front/nginx.conf > $destination/nginx.conf
    cp devops/build/front/package.json $destination
fi

if (( $back )); then
    if (( $use_packages )); then
        mkdir -p $destination/packages/lib/
        mv out/packages/lib/{dist/*,node_modules} $destination/packages/lib/
    fi
    mv out/node_modules $destination/
fi

if [[ $application == "api" ]]; then
    mkdir -p $destination/api/
    mv out/api/{src,migrations,public,node_modules} $destination/api/
    cp devops/build/api/package.json $destination
fi

if [[ $application == "apiv2" ]]; then
    mkdir -p $destination/apiv2/
    mv out/apiv2/{dist/*,node_modules} $destination/apiv2/
    cp devops/build/apiv2/package.json $destination
fi

if [[ $application == "snupport-api" ]]; then
    mkdir -p $destination/snupport-api/
    mv out/snupport-api/{src,node_modules} $destination/snupport-api/
    cp devops/build/snupport-api/package.json $destination
fi

rm -Rf out

if [[ $CC_DEPLOYMENT_ID != "" ]]; then
    # CC_NODE_BUILD_TOOL=custom
    # CC_CUSTOM_BUILD_TOOL="VITE_RELEASE=$CC_COMMIT_ID devops/build/build.sh app /tmp/$APP_ID"
    rm -rf ./*
    mv $destination/* .
fi
