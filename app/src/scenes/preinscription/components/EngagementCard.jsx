import React, { useState } from "react";

export default function EngagementCard({ program }) {
  const [isOpen, setIsOpen] = useState(false);
  const imgSrc = `https://snu-bucket-prod.cellar-c2.services.clever-cloud.com/programmes-engagement/${program.imageString}`;

  return (
    <article>
      <div className="h-40 w-full">
        <img src={imgSrc} alt={program.name} className="h-full w-full object-cover" />
      </div>

      <div className="border border-[#E5E5E5] p-4">
        <h3 className="text-lg h-14 font-semibold">{program.name}</h3>
        <p className={`mt-3 text-sm text-gray-500 leading-6 ${!isOpen && "line-clamp-3"}`}>{program.description}</p>

        <div className={`text-gray-500 leading-6 ${!isOpen && "hidden"}`}>
          <p className="font-bold">C'est pour ?</p>
          <p className="text-sm">{program.descriptionFor}</p>
          <p className="font-bold">Est-ce indemnisé ?</p>
          <p className="text-sm">{program.descriptionMoney}</p>
          <p className="font-bold">Quelle durée d'engagement ?</p>
          <p className="text-sm">{program.descriptionDuration}</p>
        </div>

        <button className="text-gray-500 text-sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Lire moins" : "Lire plus"}
        </button>

        <p className="m-0 text-right">
          <a
            href={program.url}
            target="_blank"
            rel="noreferrer"
            className="
          text-sm">
            Voir
          </a>
        </p>
      </div>
    </article>
  );
}
