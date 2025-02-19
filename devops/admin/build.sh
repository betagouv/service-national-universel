#!/bin/sh

set -ex

cd "$(dirname $0)/../.."

echo $VITE_RELEASE
echo $VITE_ENVIRONMENT

turbo_version=$(cat package-lock.json | grep turbo | head -n 1 | sed 's/"turbo": "\(.*\)"/\1/g')
npm install --global "turbo@$turbo_version"

turbo prune admin
cp tsconfig.front.json out
cd out
npm ci --no-audit --no-fund
turbo run build
cd ..

if [[ $CC_DEPLOYMENT_ID != "" ]]; then
    mv out/admin/build .
    mv devops/admin/run.js index.js
    rm -rf $(ls -A | grep -v "build\|index.js")
    npm init -y
    npm install serve-static
fi

ls -la