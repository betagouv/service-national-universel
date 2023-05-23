import React from "react";
import { Link } from "react-router-dom";

const ButtonLinkPrimaryOutline = ({ className = "", children = null, disabled = false, to = "/", ...rest }) => (
  <Link
    className={`rounded-lg border-[1px] border-blue-600 py-1.5 px-16 text-center text-sm text-blue-600 transition duration-100 ease-in-out hover:bg-blue-600 hover:text-white ${
      disabled && "cursor-default opacity-60 hover:bg-transparent hover:text-blue-600"
    } ${className}`}
    aria-disabled={disabled}
    to={!disabled ? to : "#"}
    {...rest}>
    {children}
  </Link>
);

export default ButtonLinkPrimaryOutline;
