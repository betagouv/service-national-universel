import React from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { fetchEquivalences } from "../repo";
import Loader from "@/components/Loader";

export function MesEngagements() {
  const { young } = useSelector((state) => state.Auth);

  const { isPending, error, data } = useQuery({
    queryKey: ["equivalences"],
    queryFn: () => fetchEquivalences(young._id),
    refetchOnWindowFocus: false,
  });

  if (isPending) return <Loader />;

  if (error) return <div>Erreur lors du chargement des missions.</div>;

  return (
    <div className="p-3 bg-gray-50 h-64">
      <section className="max-w-5xl mx-auto">
        <h2 className="font-bold m-0">Mes engagements</h2>
        {data.length === 0 ? "Vous n’avez aucun engagement en cours 🥲" : "todo"}
      </section>
    </div>
  );
}
