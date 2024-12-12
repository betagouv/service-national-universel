import React from "react";
import { Link } from "react-router-dom";
import EngagementCard from "./EngagementCard";
import usePrograms from "@/scenes/phase2/scenes/usePrograms";
import Loader from "@/components/Loader";

export default function EngagementPrograms() {
  const { data: programs, isPending, isError } = usePrograms();
  if (isPending) return <Loader />;
  if (isError) return <div>Erreur lors du chargement des données.</div>;
  return (
    <>
      <h2 className="my-4 text-xl font-bold">Découvrez d’autres formes d’engagement</h2>
      <div className="flex gap-8 overflow-x-auto md:grid md:grid-cols-2">
        {programs.slice(0, 4).map((program) => (
          <div className="w-72 flex-none md:w-full" key={program._id}>
            <EngagementCard program={program} />
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <Link
          className="mx-auto my-4 w-full border-[1px] border-blue-france-sun-113 p-2 text-center text-blue-france-sun-113 hover:border-blue-france-sun-113-hover hover:text-blue-france-sun-113-hover md:w-96"
          to="/public-engagements">
          Voir plus de formes d’engagement
        </Link>
      </div>
    </>
  );
}
