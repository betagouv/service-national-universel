#!/bin/bash

if [ "$#" -lt 1 ]; then
    echo "Generate Slack formatted changelog between 2 revisions"
    echo "Usage $0 <revision-range>"
    echo "  revision-range: see the Specifying Ranges section of gitrevisions(7)"
    exit 1
fi

# git
if ! [[ -x "$(command -v git)" ]]; then
  echo 'ERROR: git is not installed' >&2
  exit 1
fi

# jq
if ! [[ -x "$(command -v jq)" ]]; then
  echo 'ERROR: jq is not installed' >&2
  exit 1
fi

# curl
if ! [[ -x "$(command -v curl)" ]]; then
  echo 'ERROR: curl is not installed' >&2
  exit 1
fi

rev_range=$1
if [[ $rev_range == "" ]]
then
    echo "You must specify the revision-range"
    exit 1
fi

set -e
set -x

git log --pretty="%s" $rev_range > CHANGELOG.txt


sed -E "s/(^.*: ([0-9]*)( -)?.*$)/\2\t\1/g" CHANGELOG.txt |
    sort -b > NOTION_ID_CHANGELOG.csv
# NOTION_ID_CHANGELOG.csv is tab-separated with columns (Notion.identifiant, revision.log)

cut -d $'\t' -f 1 NOTION_ID_CHANGELOG.csv | # get notion_ids
    sed '/^\s*$/d' | # remove empty lines (Notion.identifiant can be unset)
    uniq > NOTION_IDS.txt # remove duplicates

identifiant_id='%7B%3Ci~' # id of property "Identifiant"
sed -e 's/\(.*\)/{"property":"Identifiant","number":{"equals":\1}}/g' NOTION_IDS.txt |
    tr "\n" "," | # Replaces new lines with commas
    sed -e 's/,$//g' | # Remove last comma
    sed -e 's/\(.*\)/{"filter":{"or":[\1]}}/g' | # format the filter as Or condition
    curl -sX POST "https://api.notion.com/v1/databases/d2af256de5e04953a0b1e45b0b67267f/query?filter_properties=title&filter_properties=$identifiant_id" \
        -H 'Authorization: Bearer '"$NOTION_API_KEY"'' \
        -H 'Notion-Version: 2022-06-28' \
        -H "Content-Type: application/json" \
        --data '@-' |
    jq -r '.results[]|"\(.properties."Identifiant".unique_id.number)\t\(.url)\t\(.properties."Tâche".title[].plain_text)"' |
    sort -b > NOTION_DATA.csv

cat NOTION_DATA.csv
# NOTION_DATA.csv is tab-separated with columns (Notion.identifiant, Notion.url, Notion.title)

join -a 1 -t$'\t' NOTION_ID_CHANGELOG.csv NOTION_DATA.csv > MERGE.csv # left outer join by notion.Identifiant


# Output Changelog
echo "<https://github.com/betagouv/service-national-universel/compare/$rev_range|Release du $(date -Idate)>"
sed -E 's/^(.+)\t(.+)\t(.+)\t(.+)$/\t\2 -> <\3|\4>/g' MERGE.csv | # create link to notion
    sed -E 's/^(.*)\t//g' | # remove first column (notion.Identifiant)
    sed 's #\([0-9]*\) <https://github.com/betagouv/service-national-universel/pull/\1|#\1> g' | # update link to PR
    grep --invert-match "chore(release): version" | # remove useless infos
    sort |
    sed -E 's/^(.*)$/• \1/g' # Add list item char



rm -f CHANGELOG.txt NOTION_ID_CHANGELOG.csv NOTION_IDS.txt NOTION_DATA.csv MERGE.csv
