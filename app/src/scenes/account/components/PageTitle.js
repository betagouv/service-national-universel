import React from "react";

const PageTitle = ({ children = null, className = "" }) => {
  return <h1 className={`text-2xl font-bold leading-7 lg:!text-3xl ${className}`}>{children}</h1>;
};

export default PageTitle;
