import React from "react";
import { Link } from "react-router-dom";
import ChevronRight from "../../../assets/icons/ChevronRight";

const LinkPrimary = ({ title = "Primary Link", to = "/", className = "", ...rest }) => {
  return (
    <Link to={to} className={`d-flex items-center gap-2 text-xs text-blue-600 ${className}`} {...rest}>
      {title} <ChevronRight className="mt-1" />
    </Link>
  );
};

export default LinkPrimary;
