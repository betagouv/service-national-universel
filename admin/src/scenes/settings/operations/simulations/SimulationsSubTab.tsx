import { AffectationService } from "@/services/affectationService";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import SimulationsHtsResults from "./SimulationHtsResult";
import { HiOutlinePaperClip } from "react-icons/hi";
import { Badge } from "@snu/ds/admin";

interface SimulationsSubTabProps {
  cohortId: string;
}

export default function SimulationsSubTab({ cohortId }: SimulationsSubTabProps) {
  const { isPending, data: simulations } = useQuery<any[]>({ queryKey: ["task", "simulations"], queryFn: async () => AffectationService.getSimulations(cohortId) });

  return (
    <div className="flex flex-col gap-8">
      {isPending && <div>Chargement...</div>}
      {simulations?.length === 0 && <div>Aucune simulation</div>}
      {simulations?.map((simulation) => (
        <div key={simulation.id} className="flex gap-4 items-center">
          <div>
            <div>{simulation.name}</div>
            <div>{simulation.createdAt}</div>
          </div>
          {/* <div>{simulation.id}</div> */}
          {/* <div>{simulation.startDate}</div> */}
          {/* <div>{simulation.endDate}</div> */}
          <SimulationsHtsResults simulation={simulation} />
          <div>
            <Badge title={simulation.status} />
            {/* <div>{simulation.libelle}</div> */}
          </div>
          {simulation.metadata?.results?.rapportUrl && (
            <a href={simulation.metadata?.results?.rapportUrl} className="border-[1px] border-blue-600 rounded-full p-2.5" target="_blank" rel="noreferrer">
              <HiOutlinePaperClip size={24} />
            </a>
          )}
          {/* <div>{simulation.updatedAt}</div> */}
        </div>
      ))}
    </div>
  );
}
