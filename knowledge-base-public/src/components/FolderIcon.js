import React from "react";

const FolderIcon = ({ className = "" }) => (
  <span className={`mr-2 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#E3E3FD] ${className}`}>
    <span className="material-icons text-[16px] text-[#000091]">folder_open</span>
  </span>
);

export default FolderIcon;
