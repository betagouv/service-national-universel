import React from "react";
import { Link } from "react-router-dom";

const ButtonLinkPrimary = ({ className = "", children = null, disabled = false, to = "/", ...rest }) => (
  <Link
    className={`flex text-sm justify-center items-center gap-2 px-3 py-2 rounded-md drop-shadow-sm bg-blue-600 text-white hover:bg-blue-700 transition ${
      disabled && "opacity-60 disabled:hover:bg-blue-600"
    } ${className}`}
    aria-disabled={disabled}
    to={!disabled ? to : "#"}
    {...rest}>
    {children}
  </Link>
);

export default ButtonLinkPrimary;
