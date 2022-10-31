import React from "react";
import ErrorIconFill from "../../../assets/icons/ErrorIconFill";

const ErrorMessage = ({ children, className = "" }) => {
  if (!children) return <></>;
  return (
    <div className="flex items-center mt-2">
      <ErrorIconFill className="mr-2 fill-[#CE0500]" />
      <div className={"text-[#CE0500] text-sm flex-1" + className}>{children}</div>
    </div>
  );
};

export default ErrorMessage;
