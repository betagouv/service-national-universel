import React from "react";
import { Link } from "react-router-dom";

const ButtonLinkLight = ({ className = "", children = null, disabled = false, to = "/", ...rest }) => (
  <Link
    className={`flex text-sm justify-center bg-white items-center gap-2 px-3 py-2 rounded-md text-center text-gray-900 border hover:bg-gray-50 transition ${
      disabled && "opacity-60 hover:bg-white"
    } ${className}`}
    aria-disabled={disabled}
    to={!disabled ? to : "#"}
    {...rest}>
    {children}
  </Link>
);

export default ButtonLinkLight;
