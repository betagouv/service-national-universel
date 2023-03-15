import React from "react";
import { Link } from "react-router-dom";
import ChevronRight from "../../../assets/icons/ChevronRight";

const LinkPrimary = ({ title = "Primary Link", to = "/", className = "", ...rest }) => {
  return (
    <Link to={to} className={`d-flex gap-2 items-center text-blue-600 text-xs ${className}`} {...rest}>
      {title} <ChevronRight className="mt-1" />
    </Link>
  );
};

export default LinkPrimary;
