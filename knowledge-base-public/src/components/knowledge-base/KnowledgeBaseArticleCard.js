import Link from "next/link";
import React from "react";

const KnowledgeBaseArticleCard = ({ title, slug, path, className = "" }) => {
  return (
    <Link
      className={`flex h-[60px] w-full max-w-[690px] flex-col justify-center overflow-hidden rounded-lg bg-white px-4 shadow-md ${className}`}
      href={`${path}/${slug}${path === "/base-de-connaissance" ? "?loadingType=article" : ""}`}
    >
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>
    </Link>
  );
};

export default KnowledgeBaseArticleCard;
