import React from "react";
import { Link } from "react-router-dom";

const ButtonLinkPrimary = ({ className = "", children = null, disabled = false, to = "/", ...rest }) => (
  <Link
    className={`flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white drop-shadow-sm transition hover:bg-blue-700 ${
      disabled && "opacity-60 hover:bg-blue-600"
    } ${className}`}
    aria-disabled={disabled}
    to={!disabled ? to : "#"}
    {...rest}>
    {children}
  </Link>
);

export default ButtonLinkPrimary;
