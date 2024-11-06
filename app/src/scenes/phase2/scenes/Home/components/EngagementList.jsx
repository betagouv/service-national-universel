import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchApplications, fetchEquivalences } from "../../../engagement.repository";
import Loader from "@/components/Loader";
import EquivalenceCard from "../../../components/EquivalenceCard";
import ApplicationCard from "../../../components/ApplicationCard";
import { APPLICATION_STATUS, EQUIVALENCE_STATUS, YOUNG_STATUS_PHASE2 } from "snu-lib";

export function EngagementList() {
  const { young } = useSelector((state) => state.Auth);
  const applications = useQuery({ queryKey: ["application"], queryFn: () => fetchApplications(young._id) });
  const equivalences = useQuery({ queryKey: ["equivalence"], queryFn: () => fetchEquivalences(young._id) });

  if (equivalences.isPending || applications.isPending) {
    return <Loader />;
  }
  if (equivalences.isError || applications.isError) {
    return (
      <div className="mt-8 mb-4 max-w-6xl px-3 mx-auto">
        <div className="p-12 bg-white rounded-lg shadow-sm">
          <p className="text-center text-gray-500">Erreur lors du chargement des engagements&nbsp;🥲</p>
        </div>
      </div>
    );
  }
  if ([...equivalences.data, ...applications.data].length === 0) {
    return (
      <div className="mt-8 mb-4 max-w-6xl px-3 mx-auto">
        <div className="p-12 bg-white rounded-lg shadow-sm">
          <p className="text-center text-gray-500">Vous n’avez aucun engagement en cours&nbsp;🥲</p>
        </div>
      </div>
    );
  }

  const cards = [...applications.data, ...equivalences.data]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .filter((engagement) => (young.statusPhase2 === YOUNG_STATUS_PHASE2.VALIDATED ? [APPLICATION_STATUS.DONE, EQUIVALENCE_STATUS.VALIDATED].includes(engagement.status) : true))
    .filter((e, i) => i < 5);

  return (
    <div className="p-3 flex gap-3 snap-x snap-mandatory overflow-x-auto overflow-y-hidden">
      {cards.map((data) => (
        <div key={data._id} className="w-72 md:w-[24rem] only:w-full only:md:w-96 flex-none snap-always snap-center">
          {data.engagementType === "mig" ? <ApplicationCard application={data} /> : <EquivalenceCard equivalence={data} />}
        </div>
      ))}
    </div>
  );
}
