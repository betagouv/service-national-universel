import React from "react";
import { Link } from "react-router-dom";

const AppLink = ({ className = "", children = null, to = "/", ...rest }) => (
  <Link className={`text-sm text-snu-purple-200 hover:text-snu-purple-300 ${className}`} to={to} {...rest}>
    {children}
  </Link>
);

export default AppLink;
