import React from "react";
import { Link } from "react-router-dom";

const ButtonLinkPrimaryOutline = ({ className = "", children = null, disabled = false, to = "/", ...rest }) => (
  <Link
    className={`rounded-lg text-blue-600 text-center text-sm py-1.5 px-16 border-blue-600 border-[1px] hover:bg-blue-600 hover:text-white transition duration-100 ease-in-out ${
      disabled && "opacity-60 hover:text-blue-600 hover:bg-transparent cursor-default"
    } ${className}`}
    aria-disabled={disabled}
    to={!disabled ? to : "#"}
    {...rest}>
    {children}
  </Link>
);

export default ButtonLinkPrimaryOutline;
