import React from "react";
import { Link } from "react-router-dom";

const BackLink = ({ children = null, className = "", ...rest }) => (
  <Link className={`text-gray-500 text-sm font-medium flex gap-3 items-center ${className}`} {...rest}>
    {children}
  </Link>
);

export default BackLink;
