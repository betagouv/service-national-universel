#!/bin/sh

if [ "$#" -lt 1 ]; then
    echo "Usage $0 <branch_name>"
    echo "Generate a custom env terraform template based on <branch_name>"
    exit 1
fi

set -e

if [[ $1 == "" ]]; then
    echo "You must specify the branch name"
    exit 1
fi

cd $(dirname $0)

branch_name=$1

if [[ -d $branch_name ]]; then
    echo "Directory $branch_name already exists. aborting !"
    exit 1
fi

set -e

env_name=$(../../../.github/scripts/get_custom_env_name.sh $branch_name)

cp -R custom $env_name
cd $env_name
sed -I".bak" "s|###___ENV_NAME___###|$env_name|g" main.tf
terraform init
