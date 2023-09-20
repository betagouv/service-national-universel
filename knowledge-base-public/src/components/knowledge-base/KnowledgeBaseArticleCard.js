import Link from "next/link";
import React from "react";
import { separateEmojiAndText } from "../../utils/index";
import { Emoji } from "../Emoji";

const KnowledgeBaseArticleCard = ({ title, slug, path, className = "" }) => {
  const [emoji, text] = separateEmojiAndText(title);
  return (
    <Link
      className={`flex h-[60px] w-full max-w-[690px] flex-col justify-center align-center overflow-hidden rounded-lg bg-white px-4 shadow-md ${className}`}
      href={`${path}/${slug}${path === "/base-de-connaissance" ? "?loadingType=article" : ""}`}
    >
      <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
        <Emoji emoji={emoji} />
        {text}
      </h3>
    </Link>
  );
};

export default KnowledgeBaseArticleCard;
