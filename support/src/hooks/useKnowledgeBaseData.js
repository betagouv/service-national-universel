import { useEffect, useState } from "react";
import useSWR from "swr";
import API from "../services/api";
import { buildTree, flattenTree } from "../utils/knowledgeBaseTree";

const useKnowledgeBaseData = (slug) => {
  const { data: response, mutate } = useSWR(API.getUrl({ path: "/support-center/knowledge-base/", query: { withTree: true, withParents: true } }));

  const [data, setData] = useState(response?.data || []);
  const [flattenedData, setFlattenedData] = useState(flattenTree(response?.data || []));
  const [item, setItem] = useState(
    flattenedData.find((i) => i.slug === slug),
    flattenedData
  );

  useEffect(() => {
    setData(response?.data || []);
    setFlattenedData(flattenTree(response?.data));
  }, [response?.data]);

  useEffect(() => {
    setItem(
      buildTree(
        flattenedData.find((i) => i.slug === slug),
        flattenedData
      )
    );
    setFlattenedData(flattenTree(response?.data));
  }, [flattenedData, slug]);

  return {
    data,
    flattenedData,
    item,
    mutate,
  };
};

export default useKnowledgeBaseData;
