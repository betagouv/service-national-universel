import React from "react";

const ErrorMessage = ({ children, className = "" }) => {
  return <div className={"text-[#CE0500] text-sm " + className}>{children}</div>;
};

export default ErrorMessage;
