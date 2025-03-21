import React, { useState } from "react";
import { Link } from "react-router-dom";
import usePrograms from "../../usePrograms";
import Loader from "@/components/Loader";
import plausibleEvent from "@/services/plausible";

export function Programs() {
  const [open, setOpen] = useState(false);
  const { isPending, error, data } = usePrograms();

  if (isPending) return <Loader />;
  if (error) return <div>Erreur lors du chargement des données.</div>;

  function handleClick() {
    if (open) plausibleEvent("Phase2/CTA - Afficher tout");
    setOpen(!open);
  }
  const sortedData = [...data].sort((a, b) => a.order - b.order);
  const programs = open ? sortedData : sortedData.slice(0, 6);
  return (
    <>
      <div className="mt-12 md:mt-20 mx-auto gap-x-4 md:gap-x-24 md:gap-y-20 grid grid-cols-2 md:grid-cols-3 w-fit">
        {programs.map((program) => (
          <ProgramCard key={program._id} program={program} />
        ))}
      </div>

      <div className="mt-20 md:mt-12 text-center">
        <button onClick={handleClick} className="text-gray-600 text-sm underline underline-offset-2">
          {open ? "Afficher moins" : "Afficher tout"}
        </button>
      </div>
    </>
  );
}

function ProgramCard({ program }) {
  const imgUrl = `https://snu-bucket-prod.cellar-c2.services.clever-cloud.com/programmes-engagement/${program.imageString}`;
  const programUrl = `/phase2/program/${program._id}`;

  return (
    <div key={program.url} className="h-56 last:h-28 md:h-auto w-40 md:w-44 even:top-28 md:even:top-0 relative">
      <Link to={programUrl} rel="noreferrer" className="hover:text-gray-800 ">
        <div className="aspect-square w-28 md:w-44 rounded-full mx-auto overflow-hidden">
          <img src={imgUrl} alt={program.name} className="h-full w-full object-cover" />
        </div>
        <p className="text-center font-bold mt-2 md:pt-[1rem] text-sm md:text-base line-clamp-3">{program.name}</p>
      </Link>
    </div>
  );
}
