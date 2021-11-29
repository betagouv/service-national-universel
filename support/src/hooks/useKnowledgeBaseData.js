import { useEffect, useState } from "react";
import useSWR from "swr";
import API from "../services/api";

const flattenBranch = (branch, flatTree) => {
  for (const child of branch?.children || []) {
    flatTree.push({ ...child, children: null });
    flattenBranch(child, flatTree);
  }
};

const flattenTree = (tree) => {
  const flatTree = [{ ...tree, children: null }];
  flattenBranch(tree, flatTree);
  return flatTree;
};

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
