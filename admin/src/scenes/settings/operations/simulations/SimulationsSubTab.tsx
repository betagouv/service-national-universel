import { AffectationService } from "@/services/affectationService";
import { useQuery } from "@tanstack/react-query";
import React from "react";

interface SimulationsSubTabProps {
  cohortId: string;
}

export default function SimulationsSubTab({ cohortId }: SimulationsSubTabProps) {
  const { isPending, data: simulations } = useQuery<any[]>({ queryKey: ["task", "simulations"], queryFn: async () => AffectationService.getSimulations(cohortId) });

  return (
    <div className="flex flex-col gap-8">
      {isPending && <div>Chargement...</div>}
      {simulations?.map((simulation) => (
        <div key={simulation.id} className="flex gap-4 items-center">
          <div>
            <div>{simulation.name}</div>
            <div>{simulation.createdAt}</div>
          </div>
          {/* <div>{simulation.id}</div> */}
          <div>{simulation.status}</div>
          <div>{simulation.libelle}</div>
          {/* <div>{simulation.startDate}</div> */}
          {/* <div>{simulation.endDate}</div> */}
          {/* <div>{JSON.stringify(simulation.metadata)}</div> */}
          {/* <div>{simulation.updatedAt}</div> */}
        </div>
      ))}
    </div>
  );
}
