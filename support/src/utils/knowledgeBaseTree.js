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

const findChildrenRecursive = async (section, allChildren, { flattenedData = [], findAll = false }) => {
  if (section.type !== "section") return;
  const children = await flattenedData.find((item) => item.parentId === section._id).sort({ type: -1, position: 1 });

  for (const child of children) {
    allChildren.push(child);
    if (findAll) await findChildrenRecursive(child, allChildren, { flattenedData, findAll });
  }
};

const findParents = async (item, flattenedData) => {
  const fromRootToItem = [{ ...item }]; // we spread item to avoid circular reference in item.parents = parents
  let currentItem = item;
  while (!!currentItem.parentId) {
    const parent = await flattenedData.find((i) => i._id === currentItem.parentId);
    fromRootToItem.unshift(parent);
    currentItem = parent;
  }
  return fromRootToItem;
};

// addParents only for first item
export const buildTree = async (root, flattenedData, { addParents = true } = {}) => {
  root.children = [];
  const children = [];
  await findChildrenRecursive(root, children, { flattenedData });
  for (const child of children) {
    await buildTree(child, flattenedData, { addParents: false });
  }
  root.children = children;
  if (addParents) root.parents = findParents(root, flattenedData);
  return root;
};
