import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "./BreadCrumb";
import KnowledgeBaseContext from "../contexts/knowledgeBase";

const computeCrumb = (items, slug) => {
  if (!slug) return [];
  const lastCrumb = items.find((i) => i.slug === slug);
  if (!lastCrumb) return [];
  let currentItem = lastCrumb;
  const fromRootToItem = [lastCrumb]; // we spread item to avoid circular reference in item.parents = parents
  while (currentItem.parentId) {
    const parent = items.find((i) => i._id === currentItem.parentId);
    if (!parent) {
      currentItem = null;
      return fromRootToItem;
    }
    fromRootToItem.unshift(parent);
    currentItem = parent;
  }
  return fromRootToItem;
};

const KnowledgeBaseAdminBreadcrumb = () => {
  const params = useParams();
  const { flattenedKB } = useContext(KnowledgeBaseContext);
  const parents = computeCrumb(flattenedKB, params?.slug);
  return <Breadcrumb parents={parents} path="/knowledge-base" />;
};

export default KnowledgeBaseAdminBreadcrumb;
