import React from "react";
import { Link } from "react-router-dom";

const BackLink = ({ children = null, className = "", ...rest }) => (
  <Link className={`flex items-center gap-3 text-sm font-medium text-gray-500 ${className}`} {...rest}>
    {children}
  </Link>
);

export default BackLink;
