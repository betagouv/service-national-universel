import React from "react";
import { HiExternalLink } from "react-icons/hi";

export function FAQ() {
  const questions = [
    {
      label: "J'ai des questions sur la mission d'intérêt général",
      url: "https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1",
    },
    {
      label: "J'ai trouvé une mission qui n'est pas sur la plateforme",
      url: "https://support.snu.gouv.fr/base-de-connaissance/jai-trouve-ma-mission-par-moi-meme-et-elle-nest-pas-encore-sur-la-plateforme",
    },
    {
      label: "J'ai des questions sur la reconnaissance d'engagement",
      url: "https://support.snu.gouv.fr/base-de-connaissance/demander-la-reconnaissance-dun-engagement-deja-realise-1",
    },
  ];

  return (
    <div className="mt-12 mx-auto max-w-5xl grid grid-rows-3 lg:grid-rows-1 lg:grid-cols-3 gap-4">
      {questions.map((question) => (
        <a
          key={question.url}
          href={question.url}
          target="_blank"
          rel="noreferrer"
          className="flex justify-between border rounded-xl p-3 items-center gap-4 bg-white shadow-sm hover:text-gray-800">
          <p className="line-clamp-2">{question.label}</p>
          <HiExternalLink className="text-xl text-gray-500 flex-none" />
        </a>
      ))}
    </div>
  );
}
