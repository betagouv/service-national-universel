import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchApplications, fetchEquivalences } from "../../repo";
import Loader from "@/components/Loader";
import EquivalenceCard from "../../components/EquivalenceCard";
import ApplicationCard from "../../components/ApplicationCard";
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
    <div className="md:max-w-6xl mx-auto px-3 flex gap-4 snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-3 mt-[1rem] md:mt-[2rem]">
      {cards.map((data) => (data.engagementType === "mig" ? <ApplicationCard key={data._id} application={data} /> : <EquivalenceCard key={data._id} equivalence={data} />))}
    </div>
  );
}
