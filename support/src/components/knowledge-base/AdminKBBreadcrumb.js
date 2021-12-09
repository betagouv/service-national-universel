import { useRouter } from "next/router";
import useKnowledgeBaseData from "../../hooks/useKnowledgeBaseData";
import Breadcrumb from "../BreadCrumb";

const computeCrumb = (items, slug) => {
  if (!slug) return [];
  const lastCrumb = items.find((i) => i.slug === slug);
  if (!lastCrumb) return [];
  let currentItem = lastCrumb;
  const fromRootToItem = [lastCrumb]; // we spread item to avoid circular reference in item.parents = parents
  while (!!currentItem.parentId) {
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

const AdminKBBreadcrumb = () => {
  const router = useRouter();
  const { flattenedData } = useKnowledgeBaseData();
  const parents = computeCrumb(flattenedData, router.query?.slug);
  return <Breadcrumb parents={parents} path="/admin/knowledge-base" />;
};

export default AdminKBBreadcrumb;
