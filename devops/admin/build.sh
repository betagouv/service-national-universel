#!/bin/sh

set -ex

rootdir="$(dirname $0)/../.."
cd $rootdir

pwd
ls -la

echo $CC_DEPLOYMENT_ID

if [[ $CC_DEPLOYMENT_ID != "" ]]; then
    rm -rf $(ls $rootdir | grep -v "package.json")
fi

ls -la

exit 1

echo $VITE_RELEASE
echo $VITE_ENVIRONMENT

turbo_version=$(cat package-lock.json | grep turbo | head -n 1 | sed 's/"turbo": "\(.*\)"/\1/g')
npm install --global "turbo@$turbo_version"

turbo prune admin
cp tsconfig.front.json out
cd out
npm ci --no-audit --no-fund
turbo run build