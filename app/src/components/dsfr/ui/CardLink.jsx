import React from "react";
import { HiArrowRight } from "react-icons/hi";
import { Link } from "react-router-dom";

export default function CardLink({ label, picto, url }) {
  return (
    <div className="flex gap-4 p-2 items-center w-full border-[1px] text-sm">
      <div className="flex-none flex items-center justify-center w-12 md:w-24 h-24">{picto}</div>
      <div>
        <p className="leading-relaxed">{label}</p>
        <Link to={url} className="text-blue-france-sun-113 underline underline-offset-4">
          En savoir plus
          <HiArrowRight className="inline-block ml-2" />
        </Link>
      </div>
    </div>
  );
}
