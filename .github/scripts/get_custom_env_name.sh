#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Usage $0 <branch_name>"
    echo "Format environment name based on <branch_name>"
    exit 1
fi

if [[ $1 == "" ]]
then
    echo "You must specify the branch name"
    exit 1
fi

echo $1 |
tr '[:upper:]' '[:lower:]' | # lowercase
tr "_" "-" | # replace _ by -
tr -cd '[:alnum:]-' | # remove all except alnum + '-'
tr -s '-' | # removes duplicated '-'
cut -c 1-25 | # crop to 25 characters
sed 's/^[-]*//' | # left trim '-'
sed 's/[-]*$//' # right trim '-'
