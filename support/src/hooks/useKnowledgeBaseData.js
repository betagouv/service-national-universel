import { useEffect, useState } from "react";
import useSWR from "swr";
import API from "../services/api";
import { buildTree } from "../utils/knowledgeBaseTree";

const root = { type: "root", slug: "", _id: null };

const buildItemTree = (slug, flattenedData, tree, debug) => {
  if (!slug) return tree;
  if (!flattenedData.find((i) => i.slug === slug)) return tree;
  return buildTree(
    flattenedData.find((i) => i.slug === slug),
    flattenedData,
    { debug }
  );
};

const useKnowledgeBaseData = ({ slug = "", debug = false } = {}) => {
  const { data: response, mutate } = useSWR(API.getUrl({ path: "/support-center/knowledge-base/all" }));
  // whole tree, from root to all articles with nested children
  const [tree, setTree] = useState(buildTree(root, response?.data || [], { debug }));
  // flattened tree as a flat array
  const [flattenedData, setFlattenedData] = useState(response?.data || []);
  // whole tree from specific section
  const [item, setItem] = useState(buildItemTree(slug, flattenedData, tree, debug));

  useEffect(() => {
    setFlattenedData(response?.data || []);
    setTree(buildTree(root, response?.data || [], { debug }));
  }, [response?.data]);

  useEffect(() => {
    setItem(buildItemTree(slug, flattenedData, tree, debug));
  }, [flattenedData, slug]);

  return {
    tree,
    flattenedData,
    item,
    mutate,
  };
};

export default useKnowledgeBaseData;
