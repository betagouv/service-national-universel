import React from "react";

const PageTitle = ({ children = null, className = "" }) => {
  return <h1 className={`font-bold text-2xl leading-7 lg:!text-3xl ${className}`}>{children}</h1>;
};

export default PageTitle;
