import api from "@/services/api";
import { getNewLink } from "@/utils";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { YOUNG_STATUS } from "snu-lib";
import DashboardContainer from "../../../components/DashboardContainer";
import BoxWithPercentage from "../../../moderator-ref/subscenes/sejour/components/BoxWithPercentage";
import Details from "@/scenes/dashboardV2/components/inscription/Details";
import Presences from "../../../moderator-ref/subscenes/sejour/components/Presences";
import StatusPhase1 from "../../../moderator-ref/subscenes/sejour/components/StatusPhase1";

export default function Index() {
  const { user, sessionPhase1 } = useSelector((state) => state.Auth);
  const cohort = sessionPhase1.cohort;
  const sessionId = sessionPhase1._id;
  const centerId = sessionPhase1.cohesionCenterId;

  const selectedFilters = {
    status: [YOUNG_STATUS.VALIDATED],
    cohort: [cohort],
  };
  const [data, setData] = useState({});

  useEffect(() => {
    queryCenter();
  }, []);

  const queryCenter = async () => {
    const { resultYoung } = await api.post("/elasticsearch/dashboard/sejour/head-center", {
      filters: Object.fromEntries(Object.entries(selectedFilters)),
    });
    setData(resultYoung);
  };
  return (
    <DashboardContainer active="sejour" availableTab={["general", "sejour"]}>
      <div className="flex flex-col gap-8">
        <h1 className="text-[28px] font-bold leading-8 text-gray-900">Général</h1>
        <div className="flex items-stretch gap-4 ">
          <div className="flex w-[30%] flex-col gap-4">
            <BoxWithPercentage
              total={data?.sanitaryTotal || 0}
              number={data?.sanitary?.false || 0}
              title="Fiches Sanitaires"
              subLabel="non receptionnées"
              redirect={getNewLink({
                base: `/centre/${centerId}/${sessionId}/fiche-sanitaire`,
                filter: selectedFilters,
                filtersUrl: [queryString.stringify({ cohesionStayMedicalFileReceived: "false" })],
              })}
            />
            <BoxWithPercentage
              total={data?.participationTotal || 0}
              number={data?.participation?.false || 0}
              title="Participation"
              subLabel="restants à confirmer"
              redirect={getNewLink({
                base: `/centre/${centerId}/${sessionId}/general`,
                filter: selectedFilters,
                filtersUrl: [queryString.stringify({ youngPhase1Agreement: "false" })],
              })}
            />
          </div>
          <StatusPhase1 statusPhase1={data?.statusPhase1} total={data?.statusPhase1Total} filter={selectedFilters} role={user.role} sessionId={sessionId} centerId={centerId} />
        </div>
        <Presences
          presence={data?.presence}
          JDM={data?.JDM}
          depart={data?.depart}
          departTotal={data?.departTotal}
          departMotif={data?.departMotif}
          filter={selectedFilters}
          role={user.role}
          sessionId={sessionId}
          centerId={centerId}
          cohortHeadCenter={cohort}
        />
        <Details selectedFilters={selectedFilters} role={user.role} sessionId={sessionId} centerId={centerId} />
      </div>
    </DashboardContainer>
  );
}
