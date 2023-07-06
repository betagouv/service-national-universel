import React from "react";

const Article = ({ className = "" }) => (
  <div className={`flex w-full max-w-[690px] flex-col overflow-hidden rounded-lg bg-white px-4 shadow-md ${className}`}>
    <div className="flex h-[60px] w-full items-center justify-center pl-4 pr-9">
      <div className="mr-4 h-8 w-8 rounded-md bg-gray-200" />
      <div className="h-6 flex-1 rounded bg-gray-200" />
    </div>
  </div>
);

export default Article;
