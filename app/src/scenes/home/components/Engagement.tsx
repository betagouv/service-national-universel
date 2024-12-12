import React from "react";
import { Link } from "react-router-dom";
import Loader from "@/components/Loader";
import usePrograms from "@/scenes/phase2/scenes/usePrograms";
import { HiExternalLink } from "react-icons/hi";
import { ProgramType } from "snu-lib";

export default function Engagement() {
  const { data: programs, isPending, isError } = usePrograms();
  if (isPending) return <Loader />;
  if (isError) return <div>Erreur</div>;
  return (
    <section id="engagements" className="max-w-6xl mx-auto p-[1rem] md:p-[0rem]">
      <p className="font-bold leading-loose">Découvrez d’autres formes d’engagement</p>
      <p className="mt-1 text-gray-500">Si l’engagement vous donne envie, vous trouverez des dispositifs qui pourront vous intéresser.</p>
      <div className="flex gap-6 overflow-x-auto mt-3 pb-3">
        {programs.map((program) => {
          return <EngagementCard key={program._id} program={program} />;
        })}
      </div>
      <Link to="/public-engagements">
        <div className="w-full md:w-fit mt-1 text-sm border-[1px] border-gray-300 px-6 py-2 text-center rounded-md">Découvrir les possibilités d'engagement</div>
      </Link>
    </section>
  );
}

function EngagementCard({ program }: { program: ProgramType }) {
  const imgSrc = `https://snu-bucket-prod.cellar-c2.services.clever-cloud.com/programmes-engagement/${program.imageString}`;

  return (
    <div className="w-72 h-88 flex-none flex flex-col">
      <div className="h-36 w-full rounded-t-lg overflow-hidden">
        <a href={program.url} target="_blank" rel="noreferrer">
          <img src={imgSrc} className="h-full w-full object-cover" />
        </a>
      </div>

      <div className="border-x-[1px] border-b-[1px] border-gray-300 p-3 rounded-b-lg flex flex-col flex-grow">
        <p className="font-medium leading-6">{program.name}</p>
        <p className="mt-2 text-sm leading-6 text-gray-500 line-clamp-3">{program.description}</p>
        <a href={program.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm mt-auto">
          Lire plus
          <HiExternalLink className="inline-block ml-1 align-middle" />
        </a>
      </div>
    </div>
  );
}
