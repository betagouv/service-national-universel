import { useEffect, useState } from "react";
import useSWR from "swr";
import API from "../services/api";
import { flattenTree } from "../utils/knowledgeBaseTree";

const useKnowledgeBaseData = () => {
  const { data: response } = useSWR(API.getUrl({ path: "/support-center/knowledge-base/", query: { withTree: true, withParents: true } }));

  const [data, setData] = useState(response?.data || []);
  const [flattenedData, setFlattenedData] = useState(flattenTree(response?.data || []));
  useEffect(() => {
    setData(response?.data || []);
    setFlattenedData(flattenTree(response?.data));
  }, [response?.data]);

  return {
    data,
    flattenedData,
  };
};

export default useKnowledgeBaseData;
