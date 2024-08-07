import React, { useState } from "react";
import { RiArrowRightLine } from "react-icons/ri";

export default function EngagementCard({ program }) {
  const [isOpen, setIsOpen] = useState(false);
  const imgSrc = `https://snu-bucket-prod.cellar-c2.services.clever-cloud.com/programmes-engagement/${program.imageString}`;

  return (
    <article className="h-min-[700px] min-w-[16rem] md:w-full">
      <div className="h-[155px] w-full">
        <a href={program.url} target="_blank" rel="noreferrer">
          <img src={imgSrc} alt={program.name} className="h-full w-full object-cover" />
        </a>
      </div>
      <div className={`min-h-min border border-[#E5E5E5] p-4 ${!isOpen && "h-[250px]"} flex flex-col`}>
        <h3 className="text-lg min-h-[40px] font-semibold">{program.name}</h3>
        <div className={`mt-3 text-[14px] text-[#4B5563] leading-6 ${!isOpen && "h-[70px] overflow-hidden text-ellipsis"}`}>{program.description}</div>
        <div className={`flex flex-col text-[14px] text-[#4B5563] leading-6 ${!isOpen && "hidden"}`}>
          <p className="font-bold">C'est pour ?</p>
          <p>{program.descriptionFor}</p>
          <p className="font-bold">Est-ce indemnisé ?</p>
          <p>{program.descriptionMoney}</p>
          <p className="font-bold">Quelle durée d'engagement ?</p>
          <p>{program.descriptionDuration}</p>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <button
            className="text-gray-500 text-sm"
            onClick={() => {
              setIsOpen(!isOpen);
            }}>
            {isOpen ? "Lire moins" : "Lire plus"}
          </button>
          <a href={program.link} target="_blank" rel="noreferrer" className="visited:text-[#161616]">
            <RiArrowRightLine className="text-blue-france-sun-113 hover:text-blue-france-sun-113-hover text-xl" />
          </a>
        </div>
      </div>
    </article>
  );
}
