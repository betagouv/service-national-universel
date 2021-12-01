import { useEffect, useState } from "react";
import useSWR from "swr";
import API from "../services/api";
import { buildTree, flattenTree } from "../utils/knowledgeBaseTree";

const useKnowledgeBaseData = (slug) => {
  const { data: response, mutate } = useSWR(API.getUrl({ path: "/support-center/knowledge-base/", query: { withTree: true, withParents: true } }));

  // whole tree, from root to all articles with nested children
  const [data, setData] = useState(response?.data || []);
  // flattened tree as a flat array
  const [flattenedData, setFlattenedData] = useState(flattenTree(response?.data || []));
  // whole tree from specific section
  const [item, setItem] = useState(
    slug
      ? buildTree(
          flattenedData.find((i) => i.slug === slug),
          flattenedData
        )
      : data
  );

  useEffect(() => {
    setData(response?.data || []);
    setFlattenedData(flattenTree(response?.data));
  }, [response?.data]);

  useEffect(() => {
    if (!!flattenedData.length) {
      if (!!slug) {
        setItem(
          buildTree(
            flattenedData.find((i) => i.slug === slug),
            flattenedData
          )
        );
      } else {
        setItem(data);
      }
    }
  }, [flattenedData, slug]);

  return {
    data,
    flattenedData,
    item,
    mutate,
  };
};

export default useKnowledgeBaseData;
