import { getYoungCountByCohort } from "@/services/young.service";
import { Session } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { Link } from "react-router-dom";
import { CohortDto, YOUNG_STATUS } from "snu-lib";

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
        sessionPhase1Id: [sejour._id],
      }),
    enabled: !!sejour._id,
  });

  return (
    <div className="flex w-full flex-1 items-center justify-center rounded-md border-[1px] border-blue-300 bg-blue-100 mb-2">
      <Link className="rounded-md px-4 py-2 text-sm" to={`/centre/${centreId}/${sejour._id}/general`}>
        Voir les volontaires ({isLoading || isError ? "..." : youngCount})
      </Link>
    </div>
  );
}
