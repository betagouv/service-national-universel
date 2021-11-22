export const filterTags = (tag, index, tags) => {
  if (tags.includes("public")) return tag === "public";
  if (tags.includes("all")) return tag === "all";
  return true;
};
