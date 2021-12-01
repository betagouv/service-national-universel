const sortItemsInSection = (item1, item2) => {
  if (item1.type !== item2.type) {
    if (item1.type === "article") return 1;
    return -1;
  }
  return item1.position > item2.position ? 1 : -1;
};

export const flattenBranch = (branch, flatTree) => {
  for (const child of branch?.children || []) {
    flatTree.push({ ...child, children: null });
    flattenBranch(child, flatTree);
  }
};

export const flattenTree = (tree) => {
  const flatTree = [{ ...tree, children: null }];
  flattenBranch(tree, flatTree);
  return flatTree;
};

const findParents = (item, flattenedData) => {
  if (!item.parentId) return [];
  const fromRootToItem = [{ ...item }]; // we spread item to avoid circular reference in item.parents = parents
  let currentItem = item;
  while (!!currentItem.parentId) {
    const parent = flattenedData.find((i) => i._id === currentItem.parentId);
    fromRootToItem.unshift(parent);
    currentItem = parent;
  }
  return fromRootToItem;
};

// addParents only for first item
export const buildTree = (item, flattenedData, { addParents = true, debug } = {}) => {
  if (!["root", "section"].includes(item.type)) return item;
  const populatedSection = item;
  const children = [...flattenedData.filter((i) => i.parentId === item._id)].sort(sortItemsInSection);
  for (const child of children) {
    buildTree(child, flattenedData, { addParents: false, debug });
  }
  populatedSection.children = children;
  if (addParents) populatedSection.parents = findParents(populatedSection, flattenedData);
  return populatedSection;
};
