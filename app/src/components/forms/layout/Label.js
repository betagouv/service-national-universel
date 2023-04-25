import React from "react";

// Children should be an input
const Label = ({ children = null, title = "", hasError = false, className = "", titleClassName = "", ...rest }) => {
  return (
    <label
      className={`flex flex-col justify-center border-[1px] min-h-[54px] w-full py-2 px-3 rounded-lg bg-white border-gray-300 disabled:border-gray-200 focus-within:border-blue-600 m-0 ${
        hasError && "border-red-500"
      } ${className}`}
      {...rest}>
      {title ? <p className={`text-xs leading-4 text-gray-500 disabled:text-gray-400 ${titleClassName}`}>{title}</p> : null}
      {children}
    </label>
  );
};

export default Label;
