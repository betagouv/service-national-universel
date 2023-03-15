import React from "react";
import { Link } from "react-router-dom";

const ButtonLinkPrimary = ({ className = "", children, ...rest }) => (
  <Link
    className={`flex text-sm justify-center items-center gap-2 px-3 py-2 rounded-md drop-shadow-sm disabled:opacity-60 bg-blue-600 text-white hover:bg-blue-700 disabled:hover:bg-blue-600 transition ${className}`}
    {...rest}>
    {children}
  </Link>
);

export default ButtonLinkPrimary;
