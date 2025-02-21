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
    # STATIC
    # CC_NODE_VERSION="20.17"
    # CC_WEBROOT="/build"
    # CC_PRE_BUILD_HOOK="VITE_RELEASE=$CC_COMMIT_ID devops/admin/build.sh"
    # mv devops/admin/.htaccess ./build
    # rm -rf $(ls -A | grep -v "build")

    # NODEJS serve-static
    # CC_NODE_BUILD_TOOL=custom
    # CC_CUSTOM_BUILD_TOOL="VITE_RELEASE=$CC_COMMIT_ID devops/admin/build.sh"
    # mv devops/admin/index.js devops/admin/package.json devops/admin/package-lock.json .
    # rm -rf $(ls -A | grep -v "build\|index.js\|package.json\|package-lock.json")
    # npm ci

    # NODEJS nginx
    # CC_NODE_BUILD_TOOL=custom
    # CC_CUSTOM_BUILD_TOOL="VITE_RELEASE=$CC_COMMIT_ID devops/admin/build.sh"
    # CC_RUN_COMMAND="nginx -g 'daemon off;' -c nginx.conf"
    mv devops/admin/nginx.conf devops/admin/package.json .
    rm -rf $(ls -A | grep -v "build\|nginx.conf\|package.json")
    npm install
fi

ls -la