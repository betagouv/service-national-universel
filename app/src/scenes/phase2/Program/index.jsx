import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchProgram } from "../repo";
import Loader from "@/components/Loader";
import ProgramWithMissionList from "./ProgramWithMissionList";

export default function Program() {
  const { id } = useParams();
  const { isPending, error, data } = useQuery({ queryKey: ["program", id], queryFn: () => fetchProgram(id) });

  if (isPending) return <Loader />;
  if (error) return <div>Erreur lors du chargement des données.</div>;
  if (data.publisherName) return <ProgramWithMissionList program={data} />;
  return <div>Program</div>;
}
