import React from "react";

const ExternalLink = ({ href, children, rel = "", target = "_blank", className = "" }) => (
  <a href={href} className={`text-blue-600 hover:text-blue-700 ${className} text-xs font-medium`} target={target} rel={rel}>
    {children}&nbsp;›
  </a>
);

export default ExternalLink;
