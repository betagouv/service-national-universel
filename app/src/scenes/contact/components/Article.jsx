import { supportURL } from "@/config";
import React from "react";
import { HiArrowRight } from "react-icons/hi";

export function Article({ article }) {
  return (
    <a href={`${supportURL}/base-de-connaissance/${article.slug}`} target="_blank" rel="noopener noreferrer" className="border p-4 flex flex-col gap-4">
      <h4 className="text-base font-semibold">
        {article.emoji} {article.title}
      </h4>
      <p className="text-sm leading-relaxed text-gray-600">{article.body}</p>
      <p className="text-sm text-blue-france-sun-113 underline underline-offset-4 mt-auto">
        Lire l'article
        <HiArrowRight className="inline-block ml-2" />
      </p>
    </a>
  );
}
