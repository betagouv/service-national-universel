import React from "react";
import ChevronRight from "../../../assets/icons/ChevronRight";

const ExternalLinkPrimary = ({ title = "Primary Link", href = "#", className = "", ...rest }) => {
  return (
    <a href={href} className={`d-flex items-center gap-2 text-xs text-blue-600 ${className}`} {...rest}>
      {title} <ChevronRight className="mt-1" />
    </a>
  );
};

export default ExternalLinkPrimary;
