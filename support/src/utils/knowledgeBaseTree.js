const sortItemsInSection = (item1, item2) => {
  if (item1.type !== item2.type) {
    if (item1.type === "article") return 1;
    return -1;
  }
  return item1.position > item2.position ? -1 : 1;
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

const findChildrenRecursive = (section, allChildren, { flattenedData = [], findAll = false }) => {
  if (section.type !== "section") return;
  const children = flattenedData.filter((item) => item.parentId === section._id).sort(sortItemsInSection);

  for (const child of children) {
    allChildren.push(child);
    if (findAll) findChildrenRecursive(child, allChildren, { flattenedData, findAll });
  }
};

const findParents = (item, flattenedData) => {
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
export const buildTree = (root, flattenedData, { addParents = true } = {}) => {
  root.children = [];
  const children = [];
  findChildrenRecursive(root, children, { flattenedData });
  for (const child of children) {
    buildTree(child, flattenedData, { addParents: false });
  }
  root.children = children;
  if (addParents) root.parents = findParents(root, flattenedData);
  return root;
};
