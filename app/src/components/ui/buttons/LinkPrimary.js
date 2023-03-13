import React from "react";
import { Link } from "react-router-dom";

export default function LinkPrimary({ children, className, ...rest }) {
  return (
    <Link {...rest} className={`text-center text-sm rounded-md text-white py-2 bg-blue-600 hover:brightness-110 active:brightness-125 shadow-ninaBlue transition ${className}`}>
      {children}
    </Link>
  );
}
