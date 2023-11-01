import React, { useState } from "react";
import { RiArrowRightLine } from "react-icons/ri";

export default function CardEngagement({ program }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="h-min-[700px] min-w-[16rem] md:w-full">
      <div className="h-[155px] w-full ">
        <a href={program.link} target="_blank" rel="noreferrer">
          <img src={program.picture} className="h-full w-full object-cover" />
        </a>
      </div>
      <div className={`min-h-min border border-[#E5E5E5] p-4 ${!isOpen && "h-[250px]"} flex flex-col`}>
        <h3 className="text-lg min-h-[40px] font-semibold">{program.title}</h3>
        <div className={`mt-3 text-[13px] leading-6 ${!isOpen && "h-[70px] overflow-hidden text-ellipsis"}`}>{program.description}</div>
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
