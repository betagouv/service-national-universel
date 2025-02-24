#!/bin/sh

set -e

if [ "$#" -lt 2 ]; then
    echo "Anonymize data and export to destination database"
    echo "Usage $0 <application> <destination>"
    echo "  application: Application name (app, admin)"
    echo "  destination: Build output directory"
    exit 1
fi

application=$1
destination=$2

if [[ $application == "" ]]
then
    echo "You must specify the application"
    exit 1
fi

if [[ $destination == "" ]]
then
    echo "You must specify the destination directory"
    exit 1
fi

cd "$(dirname $0)/../.."

echo $VITE_RELEASE
echo $VITE_ENVIRONMENT

turbo_version=$(cat package-lock.json | grep turbo | head -n 1 | sed 's/"turbo": "\(.*\)"/\1/g')
npm install --global "turbo@$turbo_version"

turbo prune $application
cp tsconfig.front.json out
cd out
npm ci --no-audit --no-fund
turbo run build
cd ..

output_dir="$destination/$application"
mkdir -p $output_dir
mv out/$application/build $output_dir
envsubst '$APP_HOME $PORT' < devops/admin/nginx.conf > $output_dir/nginx.conf
cp devops/admin/package.json $output_dir
rm -Rf out

if [[ $CC_DEPLOYMENT_ID != "" ]]; then
    rm -rf .
    mv $output_dir/* .

    # NODEJS nginx
    # CC_NODE_BUILD_TOOL=custom
    # CC_CUSTOM_BUILD_TOOL="VITE_RELEASE=$CC_COMMIT_ID devops/admin/build.sh"
    # CC_RUN_COMMAND="nginx -c $APP_HOME/nginx.conf"
fi