import React from "react";
import ErrorIconFill from "../../../assets/icons/ErrorIconFill";

const ErrorMessage = ({ children, className = "" }) => {
  if (!children) return <></>;
  return (
    <div className="mt-2 flex items-center">
      <ErrorIconFill className="mr-2 fill-[#CE0500]" />
      <div className={"flex-1 text-sm text-[#CE0500]" + className}>{children}</div>
    </div>
  );
};

export default ErrorMessage;
