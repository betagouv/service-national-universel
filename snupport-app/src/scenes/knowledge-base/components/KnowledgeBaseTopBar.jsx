import React from "react";
import ProfileButton from "../../../components/ProfileButton";
import KnowledgeBaseSearch from "./KnowledgeBaseSearch";

const KnowledgeBaseTopBar = () => {
  return (
    <div className="sticky top-0 z-50 flex h-16 flex-none items-center justify-end bg-white px-6 shadow-sm">
      <div className="flex-shrink flex-grow">
        <KnowledgeBaseSearch />
      </div>
      <ProfileButton />
    </div>
  );
};

export default KnowledgeBaseTopBar;
