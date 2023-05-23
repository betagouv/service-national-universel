import React from "react";

const FormRow = ({ children = null }) => {
  return <div className="flex flex-col lg:flex-row lg:gap-6">{children}</div>;
};

export default FormRow;
