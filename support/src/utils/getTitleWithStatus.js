const getTitleWithStatus = ({ title, status }) => {
  if (!title) return null;
  return `${title} ${status === "DRAFT" ? "(BROUILLON)" : ""}`;
};

export default getTitleWithStatus;
