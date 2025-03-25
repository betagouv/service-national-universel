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
    queryFn: () => AnalyticsService.getYoungCount({ filters: { cohortId: [cohortId], ...listeDiffusion?.filters } }),
    enabled: !!listeDiffusion,
  });

  if (!listeDiffusion) {
    return null;
  }
  return <span className="ml-2">({analytic?.count ?? "..."})</span>;
}
