import React from "react";

// Children should be an input
const Label = ({ children = null, title = "", hasError = false, className = "", titleClassName = "", ...rest }) => {
  return (
    <label
      className={`m-0 flex min-h-[54px] w-full flex-col justify-center rounded-lg border-[1px] border-gray-300 bg-white py-2 px-3 focus-within:border-blue-600 disabled:border-gray-200 ${
        hasError && "border-red-500"
      } ${className}`}
      {...rest}>
      {title ? <p className={`text-xs leading-4 text-gray-500 disabled:text-gray-400 ${titleClassName}`}>{title}</p> : null}
      {children}
    </label>
  );
};

export default Label;
