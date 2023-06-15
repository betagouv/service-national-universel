import React from "react";
import { Link } from "react-router-dom";

const LinkInline = ({ children, to = "/", className = "", ...rest }) => {
  return (
    <Link to={to} className={`text-blue-600 underline underline-offset-4 hover:text-blue-800 hover:underline ${className}`} {...rest}>
      {children}
    </Link>
  );
};

export default LinkInline;
