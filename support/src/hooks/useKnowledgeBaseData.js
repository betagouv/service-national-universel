import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
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

  const flattenedData = response?.data || [];
  const tree = useMemo(() => buildTree(root, response?.data || [], { debug }), [flattenedData]);
  const [item, parent] = useMemo(() => {
    if (!flattenedData?.length) return [tree, null];
    if (!slug?.length) return [tree, null];
    const itemTree = buildItemTree(slug, flattenedData, tree, debug);
    if (!itemTree) {
      router.push("/admin/base-de-connaissance/");
      return [tree, null];
    }
    return [itemTree, flattenedData?.find((i) => i._id === itemTree?.parentId)];
  }, [slug, flattenedData]);

  return {
    tree,
    flattenedData,
    item,
    parent,
    mutate,
  };
};

export default useKnowledgeBaseData;
