import React from "react";

const SelectField = ({ children, className, ...rest }) => {
  return (
    <select className={`relative ${className}`} {...rest}>
      {children}
    </select>
  );
};

export default SelectField;
