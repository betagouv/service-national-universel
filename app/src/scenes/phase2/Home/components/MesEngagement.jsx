import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchApplications, fetchEquivalences } from "../../repo";
import Loader from "@/components/Loader";
import EquivalenceCard from "../../components/EquivalenceCard";
import ApplicationCard from "../../components/ApplicationCard";

export function MesEngagements() {
  const { young } = useSelector((state) => state.Auth);
  const applications = useQuery({ queryKey: ["application"], queryFn: () => fetchApplications(young._id) });
  const equivalences = useQuery({ queryKey: ["equivalence"], queryFn: () => fetchEquivalences(young._id) });

  if (equivalences.isPending || applications.isPending) {
    return <Loader />;
  }
  if (equivalences.isError || applications.isError) {
    return (
      <div className="mt-8 mb-4 bg-white rounded-lg shadow-sm p-12">
        <p className="text-center text-gray-500">Erreur lors du chargement des engagements&nbsp;🥲</p>
      </div>
    );
  }
  if ([...equivalences.data, ...applications.data].length === 0) {
    return (
      <div className="mt-8 mb-4 bg-white rounded-lg shadow-sm p-12">
        <p className="text-center text-gray-500">Vous n’avez aucun engagement en cours&nbsp;🥲</p>
      </div>
    );
  }

  const cards = [...applications.data, ...equivalences.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).filter((e, i) => i < 5);

  return (
    <div className="md:max-w-6xl mx-auto px-3 flex gap-4 snap-x snap-mandatory overflow-x-auto overflow-y-hidden pb-3 mt-[1rem] md:mt-[2rem]">
      {cards.map((data) => (data.engagementType === "mig" ? <ApplicationCard key={data._id} application={data} /> : <EquivalenceCard key={data._id} equivalence={data} />))}
    </div>
  );
}
