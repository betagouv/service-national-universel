import { SUPPORT_ROLES } from "snu-lib/roles";

const filterTags = (tag, index, tags) => {
  if (tags.includes("public")) return tag === "public";
  if (tags.includes("all")) return tag === "all";
  return true;
};

const Tags = ({ tags = [] }) =>
  tags.filter(filterTags).map((tag) => (
    <span className="bg-snu-purple-100 px-2 py-0.5 rounded-md ml-2 mb-2 text-xs text-snu-purple-700" key={tag}>
      {SUPPORT_ROLES[tag]}
    </span>
  ));

export default Tags;
