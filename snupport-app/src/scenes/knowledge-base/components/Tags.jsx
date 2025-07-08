import React from "react";

const filterTags = (tag, index, tags) => {
  if (tags.includes("public")) return tag === "public";
  if (tags.includes("all")) return tag === "all";
  return true;
};

const Tags = ({ tags = [] }) =>
  tags.filter(filterTags).map((tag) => (
    <span className="text-snu-purple-700 mr-2 mb-2 rounded-md bg-snu-purple-100 px-2 py-0.5 text-xs" key={tag}>
      {tag}
    </span>
  ));

export default Tags;
