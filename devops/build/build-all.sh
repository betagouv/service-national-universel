#!/bin/bash

set -e

if [ "$#" -lt 1 ]; then
    echo "Build all applications to destination directory"
    echo "Usage $0 <destination>"
    echo "  destination: Build output directory"
    exit 1
fi

destination=$2
if [[ $destination == "" ]]; then
    echo "You must specify the destination directory"
    exit 1
fi

cd "$(dirname $0)/../.."

turbo_version=$(cat package-lock.json | grep turbo | head -n 1 | sed 's/"turbo": "\(.*\)"/\1/g')
npm install --global "turbo@$turbo_version"

rm -Rf out
turbo prune app admin api apiv2
cp tsconfig.front.json out
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
mkdir -p $destination/packages/lib/
mv out/packages/lib/{dist/*,node_modules} $destination/packages/lib/
mv out/node_modules $destination/
cp -R patches $destination/

# api
mkdir -p $destination/api/
mv out/api/{src,migrations,public,node_modules} $destination/api/

# apiv2
mkdir -p $destination/apiv2/
mv out/apiv2/{dist/*,node_modules} $destination/apiv2/

rm -Rf out

if [[ $CC_DEPLOYMENT_ID != "" ]]; then
    # CC_NODE_BUILD_TOOL=custom
    # CC_CUSTOM_BUILD_TOOL="VITE_RELEASE=$CC_COMMIT_ID devops/build/build-all.sh /tmp/$APP_ID"
    rm -rf ./*
    mv $destination/* .
fi