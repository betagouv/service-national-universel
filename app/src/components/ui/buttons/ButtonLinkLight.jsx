import React from "react";
import { Link } from "react-router-dom";

const ButtonLinkLight = ({ className = "", children = null, disabled = false, to = "/", ...rest }) => (
  <Link
    className={`flex items-center justify-center gap-2 rounded-md border bg-white p-2 text-center text-sm text-gray-900 transition hover:bg-gray-50 ${
      disabled && "opacity-60 hover:bg-white"
    } ${className}`}
    aria-disabled={disabled}
    to={!disabled ? to : "#"}
    {...rest}>
    {children}
  </Link>
);

export default ButtonLinkLight;
