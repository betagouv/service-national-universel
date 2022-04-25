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

export const buildTree = (item, flattenedData, options) => {
  // clone items to avoid circular reference
  const clonedItem = JSON.parse(JSON.stringify(item));
  const clonedData = JSON.parse(JSON.stringify(flattenedData));

  return buildTreeRecursive(clonedItem, clonedData, options);
};

// addParents only for first item
export const buildTreeRecursive = (item, flattenedData, { addParents = true, debug } = {}) => {
  const populatedSection = item;
  if (["root", "section"].includes(item.type)) {
    const children = flattenedData.filter((i) => i.parentId === item._id).sort(sortItemsInSection);
    for (const child of children) {
      buildTreeRecursive(child, flattenedData, { addParents: false, debug });
    }
    populatedSection.children = children;
  }
  if (!["root"].includes(item.type) && addParents) {
    populatedSection.parents = findParents(populatedSection, flattenedData);
  }
  return populatedSection;
};
