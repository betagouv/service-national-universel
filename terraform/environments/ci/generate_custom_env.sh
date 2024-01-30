#!/bin/sh

if [ "$#" -lt 1 ]; then
    echo "Usage $0 <branch_name>"
    echo "  branch_name: ci, cust, sand, prod"
    echo "Generate a custom env terraform template based on <branch_name>"
    exit 1
fi

set -e

if [[ $1 == "" ]]
then
    echo "You must specify the branch name"
    exit 1
fi

cd $(dirname $0)

branch_name=$1

if [[ -d $branch_name ]]
then
    echo "Directory $branch_name already exists. aborting !"
    exit 1
fi

cp -R custom $branch_name
cd $branch_name
rm imports.tf
sed -I".bak" "s|###___ENV_NAME___###|$branch_name|g" main.tf
terraform init
