import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { HiOutlineExternalLink } from "react-icons/hi";

import { buildRequestQueryString, DestinataireListeDiffusion, ListeDiffusionEnum } from "snu-lib";

import { AnalyticsService } from "@/services/analyticsService";
import useCohort from "@/hooks/useCohort";

import { ListeDiffusionDataProps } from "../../listeDiffusion/ListeDiffusionForm";

interface DestinataireLinkProps {
  cohortId: string;
  listeDiffusion: ListeDiffusionDataProps;
}

export default function DestinataireLink({ cohortId, listeDiffusion }: DestinataireLinkProps) {
  const cohort = useCohort(cohortId);

  const { data: analytic } = useQuery({
    queryKey: ["destinataireCount", DestinataireListeDiffusion.JEUNES, cohortId, listeDiffusion?.id],
    queryFn: async () => {
      const response = await AnalyticsService.getYoungCount({ filters: { cohortId: [cohortId], ...listeDiffusion?.filters } });
      return response;
    },
    enabled: !!listeDiffusion,
  });

  if (!cohort) {
    return null;
  }

  const subQueryPath = listeDiffusion.type === ListeDiffusionEnum.VOLONTAIRES ? "volontaire" : "inscription";
  const queryPath = `/${subQueryPath}${buildRequestQueryString({ ...listeDiffusion.filters, cohort: cohort.name, page: 1 })}`;

  return (
    <Link to={queryPath} target="_blank" className="text-blue-500 flex items-center gap-1">
      Consulter les {analytic?.count ?? "..."} jeunes <HiOutlineExternalLink size={20} />
    </Link>
  );
}
