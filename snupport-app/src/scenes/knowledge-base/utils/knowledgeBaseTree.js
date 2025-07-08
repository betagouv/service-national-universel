const sortItemsInSection = (item1, item2) => {
  if (item1.type !== item2.type) {
    if (item1.type === "article") return 1;
    return -1;
  }
  return item1.position > item2.position ? 1 : -1;
};

const findParents = (item, flattenedKB) => {
  if (!item.parentId) return [];
  const fromRootToItem = [{ ...item }]; // we spread item to avoid circular reference in item.parents = parents
  let currentItem = item;
  while (currentItem.parentId) {
    const parent = flattenedKB.find((i) => i._id === currentItem.parentId);
    fromRootToItem.unshift(parent);
    currentItem = parent;
  }
  return fromRootToItem;
};

export const buildTree = (item, flattenedKB, options) => {
  // clone items to avoid circular reference
  const clonedItem = JSON.parse(JSON.stringify(item));
  const clonedData = JSON.parse(JSON.stringify(flattenedKB));

  return buildTreeRecursive(clonedItem, clonedData, options);
};

// addParents only for first item
const buildTreeRecursive = (item, flattenedKB, { addParents = true, debug } = {}) => {
  const populatedSection = item;
  if (["root", "section"].includes(item.type)) {
    const children = flattenedKB.filter((i) => i.parentId === item._id).sort(sortItemsInSection);
    for (const child of children) {
      buildTreeRecursive(child, flattenedKB, { addParents: false, debug });
    }
    populatedSection.children = children;
  }
  if (!["root"].includes(item.type) && addParents) {
    populatedSection.parents = findParents(populatedSection, flattenedKB);
  }
  return populatedSection;
};

export const buildItemTree = (slug, flattenedData, tree, debug) => {
  if (!slug) return tree;
  if (!flattenedData.find((i) => i.slug === slug)) return null;
  return buildTree(
    flattenedData.find((i) => i.slug === slug),
    flattenedData,
    { debug }
  );
};

export const contentSummary = (sectionChildren, isRoot) => {
  const answers = sectionChildren.filter((child) => child.type === "article");
  const sections = sectionChildren.filter((child) => child.type === "section");
  if (!answers.length && !sections.length) return null;
  const sectionsSummary = `${sections.length} ${isRoot ? "" : "sous-"}thématique${sections.length > 1 ? "s" : ""}`;
  const answersSummary = `${answers.length} article${answers.length > 1 ? "s" : ""}`;
  if (!answers.length) return sectionsSummary;
  if (!sections.length) return answersSummary;

  return `${answersSummary} \u00A0\u2022\u00A0 ${sectionsSummary}`;
};

export const contentSummaryArticle = (sectionChildren) => {
  const answers = sectionChildren.filter((child) => child.type === "article");
  if (!answers.length) return null;
  const answersSummary = `${answers.length} article${answers.length > 1 ? "s" : ""}`;

  return answersSummary;
};

export const sortAndRenderTitles = (sectionChildren) => {
  const sectionItems = sectionChildren
    .filter((child) => child.type === "section" && child.title)
    .sort((a, b) => a.position - b.position)
    .slice(0, 3)
    .map((child) => ({
      type: "section",
      title: child.title,
      slug: child.slug,
      id: child._id,
      position: child.position,
    }));

  const sectionCount = sectionItems.length;
  const remainingItemsCount = 3 - sectionCount;

  const articleItems = sectionChildren
    .filter((child) => child.type === "article" && child.title)
    .sort((a, b) => a.position - b.position)
    .slice(0, remainingItemsCount)
    .map((child) => ({
      type: "article",
      title: child.title,
      slug: child.slug,
      id: child._id,
      position: child.position,
    }));

  const sortedItems = [...sectionItems, ...articleItems];
  return sortedItems;
};
