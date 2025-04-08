import React from "react";
import { DestinataireListeDiffusion } from "snu-lib";
import { ListeDiffusionDataProps } from "../../listeDiffusion/ListeDiffusionForm";
import { useQuery } from "@tanstack/react-query";
import { AnalyticsService } from "@/services/analyticsService";

interface DestinataireCountProps {
  cohortId: string;
  type: DestinataireListeDiffusion;
  listeDiffusion?: ListeDiffusionDataProps;
}

export default function DestinataireCount({ type, cohortId, listeDiffusion }: DestinataireCountProps) {
  const { data: analytic } = useQuery({
    queryKey: ["destinataireCount", type, cohortId, listeDiffusion?.id],
    queryFn: async () => {
      let count = 0;
      if (type === DestinataireListeDiffusion.JEUNES || type === DestinataireListeDiffusion.REPRESENTANTS_LEGAUX) {
        const response = await AnalyticsService.getYoungCount({ filters: { cohortId: [cohortId], ...listeDiffusion?.filters } });
        count = response.count;
      }
      if (type === DestinataireListeDiffusion.REPRESENTANTS_LEGAUX) {
        // on compte le nombre de jeune avec un seul RL
        const { count: jeune1RLCount } = await AnalyticsService.getYoungCount({ filters: { ...listeDiffusion?.filters, cohortId: [cohortId], parent2Email: [""] } });
        // les autres ont donc 2 RL
        const jeune2RLCount = count - jeune1RLCount;
        count += jeune2RLCount;
      }
      return { count };
    },
    enabled: !!listeDiffusion,
  });

  if (!listeDiffusion) {
    return null;
  }
  return <span className="ml-2">({analytic?.count ?? "..."})</span>;
}
