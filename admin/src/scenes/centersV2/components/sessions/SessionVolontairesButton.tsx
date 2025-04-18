import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";

import { CohortDto, YOUNG_STATUS, YOUNG_STATUS_PHASE1 } from "snu-lib";

import { Session } from "@/types";
import { getYoungCountByCohort } from "@/services/young.service";

interface SessionVolontairesButtonProps {
  centreId: string;
  session: CohortDto;
  sejour: Session;
}

export default function SessionVolontairesButton({ session, centreId, sejour }: SessionVolontairesButtonProps) {
  const {
    data: youngCount,
    isFetching: isLoading,
    isError,
  } = useQuery({
    queryKey: ["getYoungCountBySessionPhase1", session._id, centreId],
    queryFn: async () =>
      getYoungCountByCohort(session.name, {
        status: [YOUNG_STATUS.VALIDATED],
        statusPhase1: [YOUNG_STATUS_PHASE1.AFFECTED, YOUNG_STATUS_PHASE1.DONE],
        sessionPhase1Id: [sejour._id],
      }),
    enabled: !!sejour._id,
  });

  return (
    <div className="flex w-full flex-1 items-center justify-center rounded-md border-[1px] border-blue-300 bg-blue-100 mb-2">
      <Link
        className="rounded-md px-4 py-2 text-sm"
        to={`/centre/${centreId}/${sejour._id}/general?status=${YOUNG_STATUS.VALIDATED}&statusPhase1=${YOUNG_STATUS_PHASE1.AFFECTED}~${YOUNG_STATUS_PHASE1.DONE}`}>
        Voir les volontaires ({isLoading || isError ? "..." : youngCount})
      </Link>
    </div>
  );
}
