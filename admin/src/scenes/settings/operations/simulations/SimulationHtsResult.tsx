import React from "react";

interface SimulationsHtsResultsProps {
  simulation: any;
}

export default function SimulationsHtsResults({ simulation }: SimulationsHtsResultsProps) {
  return (
    <div>
      <div>En attente: {simulation.metadata?.results?.jeuneAttenteAffectation || "-"}</div>
      <div>Affectés: {simulation.metadata?.results?.jeunesDejaAffected || "-"}</div>
      {/* <div>jeunesNouvellementAffected: {simulation.metadata?.results?.jeunesNouvellementAffected}</div> */}
      <div>Performance: {simulation.metadata?.results?.selectedCost || "-"}</div>
    </div>
  );
}
