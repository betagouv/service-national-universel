import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";
import API from "../services/api";
import { buildTree } from "../utils/knowledgeBaseTree";

const root = { type: "root", slug: "", _id: null };

const buildItemTree = (slug, flattenedData, tree, debug) => {
  if (!slug) return tree;
  if (!flattenedData.find((i) => i.slug === slug)) return null;
  return buildTree(
    flattenedData.find((i) => i.slug === slug),
    flattenedData,
    { debug }
  );
};

const useKnowledgeBaseData = ({ debug = false } = {}) => {
  const router = useRouter();

  const [slug, setSlug] = useState(router.query?.slug || "");
  useEffect(() => {
    setSlug(router.query?.slug || "");
  }, [router.query?.slug]);

  const { data: response, mutate } = useSWR(API.getUrl({ path: "/support-center/knowledge-base/all" }));
  // whole tree, from root to all articles with nested children
  const [tree, setTree] = useState(buildTree(root, response?.data || [], { debug }));
  // flattened tree as a flat array
  const [flattenedData, setFlattenedData] = useState(response?.data || []);
  // whole tree from specific section
  const [item, setItem] = useState(() => {
    const initItemTree = buildItemTree(slug, flattenedData, tree, debug);
    if (!initItemTree) {
      router.push("/admin/knowledge-base/");
      return tree;
    } else {
      return initItemTree;
    }
  });
  const [parent, setParent] = useState(flattenedData.find((i) => i._id === item.parentId) || null);

  useEffect(() => {
    setFlattenedData(response?.data || []);
    setTree(buildTree(root, response?.data || [], { debug }));
  }, [response?.data]);

  useEffect(() => {
    const itemTree = buildItemTree(slug, flattenedData, tree, debug);
    if (!itemTree) {
      router.push("/admin/knowledge-base/");
      setItem(tree);
      setParent(null);
    } else {
      setItem(itemTree);
      setParent(flattenedData.find((i) => i._id === itemTree.parentId));
    }
  }, [slug]);

  // init
  useEffect(() => {
    if (!slug) setItem(tree);
  }, [tree, slug]);

  return {
    tree,
    flattenedData,
    item,
    parent,
    mutate,
  };
};

export default useKnowledgeBaseData;
