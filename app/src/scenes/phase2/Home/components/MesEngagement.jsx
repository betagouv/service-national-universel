import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchApplications, fetchEquivalences } from "../../repo";
import Loader from "@/components/Loader";
import { Link } from "react-router-dom";
import EquivalenceCard from "../../components/EquivalenceCard";
import ApplicationCard from "../../components/ApplicationCard";

export function MesEngagements() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-100 pb-2">
      <div className="max-w-5xl px-[1rem] mx-auto my-8 flex justify-between items-center">
        <h2 className="font-bold m-0">Mes engagements</h2>
        <Link to="/" className="text-blue-600">
          Voir
        </Link>
      </div>
      <EngagementList />
    </section>
  );
}

function EngagementList() {
  const { young } = useSelector((state) => state.Auth);

  const {
    isPending: isPendingApplications,
    error: errorApplications,
    data: applications,
  } = useQuery({
    queryKey: ["application"],
    queryFn: () => fetchApplications(young._id),
  });

  const {
    isPending: isPendingEquivalences,
    error: errorEquivalences,
    data: equivalences,
  } = useQuery({
    queryKey: ["equivalence"],
    queryFn: () => fetchEquivalences(young._id),
  });

  if (isPendingEquivalences || isPendingApplications) return <Loader />;

  if (errorEquivalences || errorApplications) {
    return (
      <div className="mt-8 mb-4 bg-white rounded-lg shadow-sm p-12">
        <p className="text-center">Erreur lors du chargement des engagements 🥲</p>
      </div>
    );
  }
  if (equivalences.length === 0 && applications.length === 0) {
    return (
      <div className="mt-8 mb-4 bg-white rounded-lg shadow-sm p-12">
        <p className="text-center">Vous n’avez aucun engagement en cours 🥲</p>
      </div>
    );
  }
  return (
    <div className="flex gap-4 snap-x snap-mandatory overflow-auto pb-3">
      {applications.map((application) => (
        <ApplicationCard key={application._id} application={application} />
      ))}
      {equivalences.map((equivalence) => (
        <EquivalenceCard key={equivalence._id} equivalence={equivalence} />
      ))}
    </div>
  );
}
